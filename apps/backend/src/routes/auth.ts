import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { db } from '../db';
import { users, type User, type NewUser } from '../db/schema';

// Zod schemas for validation
const registerSchema = z.object({
  name: z.string().min(2, 'பெயர் குறைந்தது 2 எழுத்துகளாக இருக்க வேண்டும் / Name must be at least 2 characters'),
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'செல்லுலார் எண் தவறானது / Invalid mobile number')
    .length(10, 'செல்லுலார் எண் 10 இலக்கங்களாக இருக்க வேண்டும் / Mobile number must be 10 digits'),
  email: z.string()
    .email('மின்னஞ்சல் முகவரி தவறானது / Invalid email address')
    .optional(),
  address: z.string().optional(),
  language: z.enum(['ta', 'en']).default('ta'),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional()
});

const loginSchema = z.object({
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'செல்லுலார் எண் தவறானது / Invalid mobile number')
    .length(10, 'செல்லுலார் எண் 10 இலக்கங்களாக இருக்க வேண்டும் / Mobile number must be 10 digits'),
  otp: z.string()
    .length(6, 'OTP 6 இலக்கங்களாக இருக்க வேண்டும் / OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP எண்களாக மட்டுமே இருக்க வேண்டும் / OTP must contain only numbers')
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  language: z.enum(['ta', 'en']).optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional()
});

const requestOtpSchema = z.object({
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'செல்லுலார் எண் தவறானது / Invalid mobile number')
    .length(10, 'செல்லுலார் எண் 10 இலக்கங்களாக இருக்க வேண்டும் / Mobile number must be 10 digits')
});

// Initialize Hono app for auth routes
const authApp = new Hono();

// Apply Clerk middleware to all routes
authApp.use('*', clerkMiddleware());

/**
 * POST /api/auth/register
 * Register a new user
 */
authApp.post(
  '/register',
  zValidator('json', registerSchema, (result, c) => {
    if (!result.success) {
      return c.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'தகவல்கள் சரியில்லை / Invalid data provided',
          details: result.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        timestamp: new Date().toISOString()
      }, 400);
    }
  }),
  async (c) => {
    try {
      const body = c.req.valid('json');
      
      // Check if user with this phone number already exists
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.phone, body.phone))
        .limit(1);

      if (existingUser.length > 0) {
        return c.json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'இந்த செல்லுலார் எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது / This phone number is already registered',
            details: []
          },
          timestamp: new Date().toISOString()
        }, 409);
      }

      // Check email uniqueness if provided
      if (body.email) {
        const existingEmailUser = await db.select()
          .from(users)
          .where(eq(users.email, body.email))
          .limit(1);

        if (existingEmailUser.length > 0) {
          return c.json({
            success: false,
            error: {
              code: 'EMAIL_EXISTS',
              message: 'இந்த மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது / This email is already registered',
              details: []
            },
            timestamp: new Date().toISOString()
          }, 409);
        }
      }

      // Create new user
      const newUser: NewUser = {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        address: body.address || null,
        role: 'customer',
        language: body.language,
        location: body.location || null,
        isVerified: false,
        isActive: true,
        joinedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const [createdUser] = await db.insert(users)
        .values(newUser)
        .returning({
          id: users.id,
          name: users.name,
          phone: users.phone,
          email: users.email,
          role: users.role,
          language: users.language,
          isVerified: users.isVerified
        });

      // TODO: Send OTP for verification
      // await sendOTP(body.phone, 'registration');

      const message = body.language === 'ta' 
        ? 'பதிவு வெற்றிகரமாக முடிந்தது! OTP அனுப்பப்பட்டுள்ளது.'
        : 'Registration successful! OTP has been sent to your phone.';

      return c.json({
        success: true,
        user: createdUser,
        message,
        nextStep: 'verify_otp'
      }, 201);

    } catch (error) {
      console.error('Registration error:', error);
      
      return c.json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'உள்ளப்புறம் பிழை / Internal server error',
          details: []
        },
        timestamp: new Date().toISOString()
      }, 500);
    }
  }
);

/**
 * POST /api/auth/request-otp
 * Request OTP for login
 */
authApp.post(
  '/request-otp',
  zValidator('json', requestOtpSchema),
  async (c) => {
    try {
      const { phone } = c.req.valid('json');

      // Check if user exists
      const [existingUser] = await db.select()
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);

      if (!existingUser) {
        return c.json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'இந்த செல்லுலார் எண் பதிவு செய்யப்படவில்லை / This phone number is not registered',
            details: []
          },
          timestamp: new Date().toISOString()
        }, 404);
      }

      if (!existingUser.isActive) {
        return c.json({
          success: false,
          error: {
            code: 'USER_INACTIVE',
            message: 'உங்கள் கணக்கு செயலில் இல்லை / Your account is inactive',
            details: []
          },
          timestamp: new Date().toISOString()
        }, 403);
      }

      // TODO: Generate and send OTP
      // const otp = generateOTP();
      // await sendOTP(phone, otp);

      const message = existingUser.language === 'ta'
        ? 'OTP அனுப்பப்பட்டுள்ளது'
        : 'OTP has been sent to your phone';

      return c.json({
        success: true,
        message,
        expiresIn: '10 minutes'
      });

    } catch (error) {
      console.error('Request OTP error:', error);
      
      return c.json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'உள்ளப்புறம் பிழை / Internal server error',
          details: []
        },
        timestamp: new Date().toISOString()
      }, 500);
    }
  }
);

/**
 * POST /api/auth/login
 * Login with phone and OTP
 */
authApp.post(
  '/login',
  zValidator('json', loginSchema),
  async (c) => {
    try {
      const { phone, otp } = c.req.valid('json');

      // TODO: Verify OTP
      // const isValidOTP = await verifyOTP(phone, otp);
      // For now, accept any 6-digit OTP for development
      const isValidOTP = /^\d{6}$/.test(otp);

      if (!isValidOTP) {
        return c.json({
          success: false,
          error: {
            code: 'INVALID_OTP',
            message: 'OTP தவறானது அல்லது காலாவதியானது / Invalid or expired OTP',
            details: []
          },
          timestamp: new Date().toISOString()
        }, 401);
      }

      // Get user details
      const [user] = await db.select()
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);

      if (!user) {
        return c.json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'பயனர் கிடைக்கவில்லை / User not found',
            details: []
          },
          timestamp: new Date().toISOString()
        }, 404);
      }

      if (!user.isActive) {
        return c.json({
          success: false,
          error: {
            code: 'USER_INACTIVE',
            message: 'உங்கள் கணக்கு செயலில் இல்லை / Your account is inactive',
            details: []
          },
          timestamp: new Date().toISOString()
        }, 403);
      }

      // Update last login time
      await db.update(users)
        .set({ 
          lastLoginAt: new Date(),
          isVerified: true, // Mark as verified after successful OTP
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

      // TODO: Generate JWT token using Clerk or custom implementation
      // const token = await generateJWT(user);
      const token = `mock_jwt_token_${user.id}_${Date.now()}`;

      return c.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          language: user.language,
          isVerified: user.isVerified
        },
        expiresIn: '24h',
        message: user.language === 'ta' 
          ? 'உள்நுழைவு வெற்றிகரம்!'
          : 'Login successful!'
      });

    } catch (error) {
      console.error('Login error:', error);
      
      return c.json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'உள்ளப்புறம் பிழை / Internal server error',
          details: []
        },
        timestamp: new Date().toISOString()
      }, 500);
    }
  }
);

/**
 * GET /api/auth/profile
 * Get current user profile
 */
authApp.get('/profile', async (c) => {
  try {
    const auth = getAuth(c);
    
    if (!auth?.userId) {
      return c.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'உள்நுழைவு தேவை / Authentication required',
          details: []
        },
        timestamp: new Date().toISOString()
      }, 401);
    }

    // TODO: Get user by Clerk userId
    // For now, extract user ID from mock token
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !token.startsWith('mock_jwt_token_')) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'செல்லாத டோக்கன் / Invalid token',
          details: []
        },
        timestamp: new Date().toISOString()
      }, 401);
    }

    const userId = token.split('_')[3];
    
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      phone: users.phone,
      email: users.email,
      address: users.address,
      role: users.role,
      language: users.language,
      location: users.location,
      isVerified: users.isVerified,
      isActive: users.isActive,
      totalBookings: users.totalBookings,
      completedBookings: users.completedBookings,
      averageRating: users.averageRating,
      joinedDate: users.joinedDate,
      lastLoginAt: users.lastLoginAt
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

    if (!user) {
      return c.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'பயனர் கிடைக்கவில்லை / User not found',
          details: []
        },
        timestamp: new Date().toISOString()
      }, 404);
    }

    return c.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'உள்ளப்புறம் பிழை / Internal server error',
        details: []
      },
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
authApp.put(
  '/profile',
  zValidator('json', updateProfileSchema),
  async (c) => {
    try {
      const auth = getAuth(c);
      
      if (!auth?.userId) {
        return c.json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'உள்நுழைவு தேவை / Authentication required',
            details: []
          },
          timestamp: new Date().toISOString()
        }, 401);
      }

      // Extract user ID from mock token
      const authHeader = c.req.header('Authorization');
      const token = authHeader?.replace('Bearer ', '');
      const userId = token?.split('_')[3];

      if (!userId) {
        return c.json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'செல்லாத டோக்கன் / Invalid token',
            details: []
          },
          timestamp: new Date().toISOString()
        }, 401);
      }

      const updateData = c.req.valid('json');

      // Check if email is being updated and is unique
      if (updateData.email) {
        const [existingEmailUser] = await db.select({ id: users.id })
          .from(users)
          .where(eq(users.email, updateData.email))
          .limit(1);

        if (existingEmailUser && existingEmailUser.id !== userId) {
          return c.json({
            success: false,
            error: {
              code: 'EMAIL_EXISTS',
              message: 'இந்த மின்னஞ்சல் ஏற்கனவே பயன்பாட்டில் உள்ளது / This email is already in use',
              details: []
            },
            timestamp: new Date().toISOString()
          }, 409);
        }
      }

      // Update user profile
      const [updatedUser] = await db.update(users)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          name: users.name,
          phone: users.phone,
          email: users.email,
          address: users.address,
          role: users.role,
          language: users.language,
          location: users.location,
          updatedAt: users.updatedAt
        });

      if (!updatedUser) {
        return c.json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'பயனர் கிடைக்கவில்லை / User not found',
            details: []
          },
          timestamp: new Date().toISOString()
        }, 404);
      }

      const message = updatedUser.language === 'ta' 
        ? 'சுயவிவரம் புதுப்பிக்கப்பட்டது!'
        : 'Profile updated successfully!';

      return c.json({
        success: true,
        user: updatedUser,
        message
      });

    } catch (error) {
      console.error('Update profile error:', error);
      
      return c.json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'உள்ளப்புறம் பிழை / Internal server error',
          details: []
        },
        timestamp: new Date().toISOString()
      }, 500);
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout user (invalidate token)
 */
authApp.post('/logout', async (c) => {
  try {
    const auth = getAuth(c);
    
    if (!auth?.userId) {
      return c.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'உள்நுழைவு தேவை / Authentication required',
          details: []
        },
        timestamp: new Date().toISOString()
      }, 401);
    }

    // TODO: Invalidate token in Clerk or token store
    // For mock implementation, we'll just return success

    return c.json({
      success: true,
      message: 'வெற்றிகரமாக வெளியேறியுள்ளீர்கள் / Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'உள்ளப்புறம் பிழை / Internal server error',
        details: []
      },
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * DELETE /api/auth/account
 * Delete user account
 */
authApp.delete('/account', async (c) => {
  try {
    const auth = getAuth(c);
    
    if (!auth?.userId) {
      return c.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'உள்நுழைவு தேவை / Authentication required',
          details: []
        },
        timestamp: new Date().toISOString()
      }, 401);
    }

    // Extract user ID from mock token
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const userId = token?.split('_')[3];

    if (!userId) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'செல்லாத டோக்கன் / Invalid token',
          details: []
        },
        timestamp: new Date().toISOString()
      }, 401);
    }

    // Instead of deleting, mark user as inactive (soft delete)
    const [deactivatedUser] = await db.update(users)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id, name: users.name, language: users.language });

    if (!deactivatedUser) {
      return c.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'பயனர் கிடைக்கவில்லை / User not found',
          details: []
        },
        timestamp: new Date().toISOString()
      }, 404);
    }

    const message = deactivatedUser.language === 'ta'
      ? 'உங்கள் கணக்கு செயலிழக்கச் செய்யப்பட்டுள்ளது'
      : 'Your account has been deactivated';

    return c.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('Delete account error:', error);
    
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'உள்ளப்புறம் பிழை / Internal server error',
        details: []
      },
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /api/auth/verify-token
 * Verify if token is valid
 */
authApp.get('/verify-token', async (c) => {
  try {
    const auth = getAuth(c);
    
    if (!auth?.userId) {
      return c.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'செல்லாத அல்லது காலாவதியான டோக்கன் / Invalid or expired token',
          details: []
        },
        timestamp: new Date().toISOString()
      }, 401);
    }

    return c.json({
      success: true,
      valid: true,
      userId: auth.userId
    });

  } catch (error) {
    console.error('Token verification error:', error);
    
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'உள்ளப்புறம் பிழை / Internal server error',
        details: []
      },
      timestamp: new Date().toISOString()
    }, 500);
  }
});

export default authApp;