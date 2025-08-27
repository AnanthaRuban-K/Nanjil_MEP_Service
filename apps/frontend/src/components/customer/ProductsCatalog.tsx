// apps/frontend/src/components/customer/ProductsCatalog.tsx - Corrected Version
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, Search, Filter, ShoppingCart, Zap, Droplets, Phone, MessageCircle, Star, AlertTriangle } from 'lucide-react';

// Unified Product interface
interface Product {
  id: string;
  sku: string;
  name_en: string;
  name_ta: string;
  brand?: string;
  model?: string;
  categoryType: 'electrical' | 'plumbing';
  subcategory?: string;
  description_en?: string;
  description_ta?: string;
  shortDescription_en?: string;
  shortDescription_ta?: string;
  costPrice: number;
  sellingPrice: number;
  mrp?: number;
  discountPercentage?: number;
  stockQuantity: number;
  minStockLevel: number;
  specifications?: Record<string, any>;
  features: string[];
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  deliveryTime?: string;
  warrantyPeriod?: string;
  installationRequired: boolean;
  installationCharge?: number;
  tags: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

type FilterCategory = 'all' | 'electrical' | 'plumbing';

export const ProductsCatalog: React.FC = () => {
  const router = useRouter();
  const { language } = useAuthStore();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock product data
  const mockProducts: Product[] = [
    // Electrical Products
    {
      id: 'prod_001',
      sku: 'LED-9W-001',
      name_en: 'LED Bulb 9W',
      name_ta: 'LED பல்பு 9W',
      brand: 'Philips',
      model: 'Essential 9W',
      categoryType: 'electrical',
      subcategory: 'lighting',
      description_en: 'Energy efficient LED bulb, 9 watts, cool white light',
      description_ta: 'ஆற்றல் சிக்கனமான LED பல்பு, 9 வாட், குளிர்ந்த வெள்ளை ஒளி',
      shortDescription_en: 'Energy efficient 9W LED bulb',
      shortDescription_ta: '9W ஆற்றல் சிக்கன LED பல்பு',
      costPrice: 120,
      sellingPrice: 150,
      mrp: 180,
      discountPercentage: 16.67,
      stockQuantity: 25,
      minStockLevel: 5,
      specifications: {
        'வாட்': '9W',
        'வோல்ட்': '220-240V',
        'வார்ரண்டி': '2 ஆண்டுகள்',
        'ஒளி': 'குளிர் வெள்ளை'
      },
      features: ['Energy Efficient', 'Long Life', '2 Year Warranty'],
      averageRating: 4.5,
      totalReviews: 23,
      isActive: true,
      isAvailable: true,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      deliveryTime: 'Same day',
      warrantyPeriod: '2 years',
      installationRequired: false,
      installationCharge: 0,
      tags: ['LED', 'Energy Saving', 'Lighting'],
      images: ['/images/products/led-bulb.jpg'],
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_002',
      sku: 'SW-4G-002',
      name_en: 'Switch Board 4 Gang',
      name_ta: 'சுவிட்ச் போர்டு 4 கேங்',
      brand: 'Anchor',
      model: 'Roma Classic',
      categoryType: 'electrical',
      subcategory: 'switches',
      description_en: '4 gang switch board with indicators, premium quality',
      description_ta: 'இண்டிகேட்டர்களுடன் 4 கேங் சுவிட்ச் போர்டு, உயர் தரம்',
      shortDescription_en: '4 gang switch board with indicators',
      shortDescription_ta: 'இண்டிகேட்டர்களுடன் 4 கேங் சுவிட்ச்',
      costPrice: 65,
      sellingPrice: 80,
      mrp: 95,
      discountPercentage: 15.79,
      stockQuantity: 15,
      minStockLevel: 3,
      specifications: {
        'கேங்': '4',
        'வார்ரண்டி': '10 ஆண்டுகள்',
        'பொருள்': 'பாலிகார்போனேட்',
        'நிறம்': 'வெள்ளை'
      },
      features: ['LED Indicators', '10 Year Warranty', 'Fire Retardant'],
      averageRating: 4.2,
      totalReviews: 18,
      isActive: true,
      isAvailable: true,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      deliveryTime: 'Same day',
      warrantyPeriod: '10 years',
      installationRequired: true,
      installationCharge: 100,
      tags: ['Switch', 'Electrical', 'Home'],
      images: ['/images/products/switch-board.jpg'],
      createdAt: new Date('2024-02-10').toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_003',
      sku: 'FAN-48-003',
      name_en: 'Ceiling Fan 48 inch',
      name_ta: 'கூரை விசிறி 48 அங்குலம்',
      brand: 'Bajaj',
      model: 'Maxima',
      categoryType: 'electrical',
      subcategory: 'fans',
      description_en: '48 inch ceiling fan with remote control, high speed motor',
      description_ta: 'ரிமோட் கண்ட்ரோலுடன் 48 அங்குல கூரை விசிறி, அதிவேக மோட்டார்',
      shortDescription_en: '48" ceiling fan with remote',
      shortDescription_ta: 'ரிமோட்டுடன் 48" கூரை விசிறி',
      costPrice: 2400,
      sellingPrice: 2800,
      mrp: 3200,
      discountPercentage: 12.5,
      stockQuantity: 8,
      minStockLevel: 2,
      specifications: {
        'அளவு': '48 அங்குலம்',
        'வேகம்': '3 வேகங்கள்',
        'ரிமோட்': 'ஆம்',
        'வார்ரண்டி': '2 ஆண்டுகள்'
      },
      features: ['Remote Control', '3 Speed', 'Reversible', 'Energy Efficient'],
      averageRating: 4.3,
      totalReviews: 34,
      isActive: true,
      isAvailable: true,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: false,
      deliveryTime: 'Next day',
      warrantyPeriod: '2 years',
      installationRequired: true,
      installationCharge: 300,
      tags: ['Fan', 'Ceiling', 'Remote', 'Electrical'],
      images: ['/images/products/ceiling-fan.jpg'],
      createdAt: new Date('2024-03-01').toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Plumbing Products
    {
      id: 'prod_004',
      sku: 'TAP-KIT-004',
      name_en: 'Kitchen Tap Single Lever',
      name_ta: 'சமையலறை குழாய் ஒற்றை லீவர்',
      brand: 'Hindware',
      model: 'Atlantic',
      categoryType: 'plumbing',
      subcategory: 'taps',
      description_en: 'Stainless steel kitchen tap with single lever operation',
      description_ta: 'ஒற்றை லீவர் செயல்பாடுடன் எஃகு சமையலறை குழாய்',
      shortDescription_en: 'SS kitchen tap single lever',
      shortDescription_ta: 'எஃகு சமையலறை குழாய்',
      costPrice: 200,
      sellingPrice: 250,
      mrp: 300,
      discountPercentage: 16.67,
      stockQuantity: 12,
      minStockLevel: 3,
      specifications: {
        'பொருள்': 'எஃகு',
        'வகை': 'ஒற்றை லீவர்',
        'வார்ரண்டி': '5 ஆண்டுகள்',
        'பூச்சு': 'குரோம்'
      },
      features: ['Single Lever', '360° Swivel', 'Aerator', 'Easy Clean'],
      averageRating: 4.1,
      totalReviews: 27,
      isActive: true,
      isAvailable: true,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      deliveryTime: 'Same day',
      warrantyPeriod: '5 years',
      installationRequired: true,
      installationCharge: 200,
      tags: ['Tap', 'Kitchen', 'Plumbing', 'Stainless Steel'],
      images: ['/images/products/kitchen-tap.jpg'],
      createdAt: new Date('2024-04-15').toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_005',
      sku: 'PIPE-PVC-005',
      name_en: 'PVC Pipe 1/2 inch',
      name_ta: 'PVC குழாய் 1/2 அங்குலம்',
      brand: 'Supreme',
      model: 'Aqua Gold',
      categoryType: 'plumbing',
      subcategory: 'pipes',
      description_en: 'PVC pipe 1/2 inch diameter, 3 meter length, high pressure rating',
      description_ta: '1/2 அங்குல விட்டம், 3 மீட்டர் நீளம் PVC குழாய், அதிக அழுத்த தாங்கும் சக்தி',
      shortDescription_en: 'PVC pipe 1/2" x 3m',
      shortDescription_ta: 'PVC குழாய் 1/2" x 3மீ',
      costPrice: 45,
      sellingPrice: 60,
      mrp: 75,
      discountPercentage: 20,
      stockQuantity: 30,
      minStockLevel: 10,
      specifications: {
        'விட்டம்': '1/2 அங்குலம்',
        'நீளம்': '3 மீட்டர்',
        'அழுத்தம்': '6 கிலோ/சதுர செமீ',
        'தரம்': 'ISI'
      },
      features: ['High Pressure Rating', 'Corrosion Resistant', 'ISI Mark', 'Lead Free'],
      averageRating: 4.4,
      totalReviews: 42,
      isActive: true,
      isAvailable: true,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: true,
      deliveryTime: 'Same day',
      warrantyPeriod: '15 years',
      installationRequired: false,
      installationCharge: 0,
      tags: ['PVC', 'Pipe', 'Plumbing', 'Supreme'],
      images: ['/images/products/pvc-pipe.jpg'],
      createdAt: new Date('2024-05-01').toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_006',
      sku: 'FLUSH-TK-006',
      name_en: 'Toilet Flush Tank',
      name_ta: 'டாய்லெட் ஃப்ளஷ் டாங்க்',
      brand: 'Parryware',
      model: 'E8140',
      categoryType: 'plumbing',
      subcategory: 'toilet',
      description_en: 'Dual flush toilet tank with complete fittings, water saving design',
      description_ta: 'முழு ஃபிட்டிங்குடன் டூயல் ஃப்ளஷ் டாய்லெட் டாங்க், நீர் சிக்கன வடிவமைப்பு',
      shortDescription_en: 'Dual flush toilet tank',
      shortDescription_ta: 'டூயல் ஃப்ளஷ் டாங்க்',
      costPrice: 1200,
      sellingPrice: 1500,
      mrp: 1800,
      discountPercentage: 16.67,
      stockQuantity: 5,
      minStockLevel: 2,
      specifications: {
        'வகை': 'டூயல் ஃப்ளஷ்',
        'கொள்ளளவு': '6/3 லிட்டர்',
        'வார்ரண்டி': '10 ஆண்டுகள்',
        'நிறம்': 'வெள்ளை'
      },
      features: ['Dual Flush', 'Water Saving', 'Complete Fittings', 'Easy Installation'],
      averageRating: 4.0,
      totalReviews: 15,
      isActive: true,
      isAvailable: true,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      deliveryTime: 'Next day',
      warrantyPeriod: '10 years',
      installationRequired: true,
      installationCharge: 500,
      tags: ['Toilet', 'Flush', 'Tank', 'Plumbing', 'Ceramic'],
      images: ['/images/products/flush-tank.jpg'],
      createdAt: new Date('2024-06-01').toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProducts(mockProducts);
      } catch (err) {
        setError(language === 'ta' 
          ? 'தயாரிப்புகளை ஏற்ற முடியவில்லை' 
          : 'Failed to load products'
        );
        console.error('Error loading products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [language]);

  const categories = [
    { 
      id: 'all' as const, 
      name_en: 'All Products', 
      name_ta: 'அனைத்தும்', 
      icon: Filter 
    },
    { 
      id: 'electrical' as const, 
      name_en: 'Electrical', 
      name_ta: 'மின்சார', 
      icon: Zap 
    },
    { 
      id: 'plumbing' as const, 
      name_en: 'Plumbing', 
      name_ta: 'குழாய்', 
      icon: Droplets 
    }
  ];

  const filteredProducts = products
    .filter(product => {
      if (selectedCategory !== 'all' && product.categoryType !== selectedCategory) {
        return false;
      }
      
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        return (
          product.name_en.toLowerCase().includes(searchLower) ||
          product.name_ta.includes(searchTerm) ||
          product.brand?.toLowerCase().includes(searchLower) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    })
    .filter(product => product.isActive && product.isAvailable);

  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      setError(language === 'ta' 
        ? 'இந்த தயாரிப்பு கிடைக்கவில்லை' 
        : 'This product is out of stock'
      );
      return;
    }

    const existingItem = cart.find(item => item.product.id === product.id);
    const maxQuantity = Math.min(product.stockQuantity, 10);
    
    if (existingItem) {
      if (existingItem.quantity >= maxQuantity) {
        setError(language === 'ta' 
          ? `அதிகபட்சம் ${maxQuantity} உருப்படிகள் மட்டுமே` 
          : `Maximum ${maxQuantity} items allowed`
        );
        return;
      }
      
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    
    setError(null);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const maxQuantity = Math.min(product.stockQuantity, 10);
    const finalQuantity = Math.min(quantity, maxQuantity);
    
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: finalQuantity }
        : item
    ));
  };

  const getTotalCartItems = (): number => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalCartValue = (): number => {
    return cart.reduce((total, item) => total + (item.product.sellingPrice * item.quantity), 0);
  };

  const handleOrderViaCall = () => {
    if (cart.length === 0) {
      setError(language === 'ta' 
        ? 'கார்ட் காலியாக உள்ளது' 
        : 'Cart is empty'
      );
      return;
    }
    
    const orderDetails = cart.map(item => 
      `${language === 'ta' ? item.product.name_ta : item.product.name_en} x${item.quantity} - ₹${item.product.sellingPrice * item.quantity}`
    ).join('\n');
    
    const installationItems = cart.filter(item => item.product.installationRequired);
    const installationText = installationItems.length > 0 
      ? `\n\n${language === 'ta' ? 'நிறுவல் தேவை:' : 'Installation required:'}\n${installationItems.map(item => 
          `${language === 'ta' ? item.product.name_ta : item.product.name_en} - ₹${item.product.installationCharge || 0}`
        ).join('\n')}`
      : '';
    
    const message = language === 'ta'
      ? `நாஞ்சில் MEP - பொருட்கள் ஆர்டர்:\n\n${orderDetails}${installationText}\n\nமொத்தம்: ₹${getTotalCartValue()}\n\nதயவுசெய்து ஆர்டர் உறுதிப்படுத்தவும்.`
      : `Nanjil MEP - Product Order:\n\n${orderDetails}${installationText}\n\nTotal: ₹${getTotalCartValue()}\n\nPlease confirm the order.`;
    
    const whatsappUrl = `https://wa.me/919876500000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCallOrder = () => {
    window.location.href = 'tel:+919876500000';
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const isLowStock = product.stockQuantity <= 5 && product.stockQuantity > 0;
    const isOutOfStock = product.stockQuantity <= 0;
    const cartItem = cart.find(item => item.product.id === product.id);
    
    return (
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="p-4">
          {/* Product Image */}
          <div className="bg-gray-100 rounded-lg h-40 mb-3 flex items-center justify-center relative overflow-hidden">
            {product.categoryType === 'electrical' ? (
              <Zap className="w-12 h-12 text-yellow-500" />
            ) : (
              <Droplets className="w-12 h-12 text-blue-500" />
            )}
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.isFeatured && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {language === 'ta' ? 'சிறப்பு' : 'Featured'}
                </span>
              )}
              {product.isBestSeller && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  {language === 'ta' ? 'அதிக விற்பனை' : 'Best Seller'}
                </span>
              )}
              {product.isNewArrival && (
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  {language === 'ta' ? 'புதிது' : 'New'}
                </span>
              )}
            </div>

            {/* Discount Badge */}
            {product.discountPercentage && product.discountPercentage > 0 && (
              <div className="absolute top-2 right-2">
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  -{product.discountPercentage.toFixed(0)}%
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="mb-3">
            <h3 className={`font-bold text-lg mb-1 line-clamp-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' ? product.name_ta : product.name_en}
            </h3>
            {product.brand && (
              <p className="text-sm text-gray-600 mb-1">{product.brand} {product.model && `• ${product.model}`}</p>
            )}
            <p className={`text-sm text-gray-700 mb-2 line-clamp-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' ? product.shortDescription_ta : product.shortDescription_en}
            </p>
          </div>

          {/* Rating */}
          {product.averageRating > 0 && (
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < Math.floor(product.averageRating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                {product.averageRating.toFixed(1)} ({product.totalReviews})
              </span>
            </div>
          )}

          {/* Key Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-2 rounded">
                {Object.entries(product.specifications).slice(0, 2).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price and Stock */}
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">₹{product.sellingPrice.toLocaleString()}</span>
                {product.mrp && product.mrp > product.sellingPrice && (
                  <span className="text-sm text-gray-500 line-through">₹{product.mrp.toLocaleString()}</span>
                )}
              </div>
              {product.installationRequired && (
                <div className={`text-xs text-orange-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {language === 'ta' ? '+ நிறுவல்' : '+ Installation'} 
                  {product.installationCharge && product.installationCharge > 0 && (
                    ` ₹${product.installationCharge}`
                  )}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${
                isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'
              }`}>
                {isOutOfStock 
                  ? (language === 'ta' ? 'தீர்ந்துவிட்டது' : 'Out of stock')
                  : isLowStock 
                  ? (language === 'ta' ? `${product.stockQuantity} மட்டும்` : `Only ${product.stockQuantity}`)
                  : (language === 'ta' ? `${product.stockQuantity} கிடைக்கிறது` : `${product.stockQuantity} in stock`)
                }
              </div>
              <div className="text-xs text-gray-500">
                {product.deliveryTime}
              </div>
            </div>
          </div>

          {/* Cart Controls or Add Button */}
          {cartItem ? (
            <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg">
              <Button
                onClick={() => updateCartQuantity(product.id, cartItem.quantity - 1)}
                size="sm"
                variant="outline"
                className="w-8 h-8 p-0"
              >
                -
              </Button>
              <span className="font-bold text-lg px-4">{cartItem.quantity}</span>
              <Button
                onClick={() => updateCartQuantity(product.id, cartItem.quantity + 1)}
                size="sm"
                variant="outline"
                className="w-8 h-8 p-0"
                disabled={cartItem.quantity >= Math.min(product.stockQuantity, 10)}
              >
                +
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => addToCart(product)}
              disabled={isOutOfStock}
              className="w-full"
              variant={isOutOfStock ? "outline" : "default"}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {isOutOfStock 
                  ? (language === 'ta' ? 'கிடைக்கவில்லை' : 'Out of Stock')
                  : (language === 'ta' ? 'கார்ட்டில் சேர்' : 'Add to Cart')
                }
              </span>
            </Button>
          )}
        </div>
      </Card>
    );
  };

  const CartSummary = () => {
    if (cart.length === 0) return null;

    return (
      <Card className="sticky bottom-4 bg-blue-600 text-white border-0 shadow-2xl">
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className={`font-bold text-lg ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' ? 'கார்ட் சுருக்கம்' : 'Cart Summary'}
              </p>
              <p className="text-sm opacity-90">
                {getTotalCartItems()} {language === 'ta' ? 'பொருட்கள்' : 'items'} • ₹{getTotalCartValue().toLocaleString()}
              </p>
            </div>
            <Button
              onClick={() => setCart([])}
              variant="outline"
              size="sm"
              className="text-blue-600 bg-white hover:bg-gray-100"
            >
              {language === 'ta' ? 'அழி' : 'Clear'}
            </Button>
          </div>
          
          {/* Cart Items */}
          <div className="max-h-32 overflow-y-auto mb-3 space-y-1">
            {cart.map(item => (
              <div key={item.product.id} className="flex justify-between items-center text-sm">
                <span className={`flex-1 truncate ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {language === 'ta' ? item.product.name_ta : item.product.name_en}
                </span>
                <span className="ml-2">x{item.quantity}</span>
              </div>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleOrderViaCall}
              variant="secondary"
              className="flex-1 text-blue-600 font-bold"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {language === 'ta' ? 'WhatsApp' : 'WhatsApp'}
              </span>
            </Button>
            <Button
              onClick={handleCallOrder}
              variant="secondary"
              className="flex-1 text-blue-600 font-bold"
            >
              <Phone className="w-4 h-4 mr-2" />
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {language === 'ta' ? 'அழைக்க' : 'Call'}
              </span>
            </Button>
          </div>
          
          {/* Order Info */}
          <div className={`text-xs opacity-75 mt-2 text-center ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' 
              ? 'கட்டணம்: சேவை முடிந்த பின் • நிறுவல் சேவை கிடைக்கும்'
              : 'Payment: After delivery • Installation service available'
            }
          </div>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'பொருட்கள் ஏற்றுகிறது...' : 'Loading products...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Card className="p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto" />
          </div>
          <p className={`text-lg font-medium mb-4 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {error}
          </p>
          <Button onClick={() => window.location.reload()}>
            <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
              {language === 'ta' ? 'மீண்டும் முயற்சி' : 'Try Again'}
            </span>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
              {language === 'ta' ? 'பின்னால்' : 'Back'}
            </span>
          </Button>

          {/* Cart Button */}
          {cart.length > 0 && (
            <Button
              variant="outline"
              className="relative bg-white shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {language === 'ta' ? 'கார்ட்' : 'Cart'}
              </span>
              <span className="ml-1 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                {getTotalCartItems()}
              </span>
            </Button>
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-black mb-4 text-gray-800 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'பொருட்கள் பட்டியல்' : 'Products Catalog'}
          </h1>
          <p className={`text-lg text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' 
              ? 'மின்சாரம் மற்றும் குழாய் பொருட்கள் - அழைத்து ஆர்டர் செய்யுங்கள்'
              : 'Electrical and Plumbing Supplies - Order by Call'
            }
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 shadow-md">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'ta' ? 'பொருட்களை தேடுங்கள்...' : 'Search products...'}
                className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg ${
                  language === 'ta' ? 'font-tamil' : 'font-english'
                }`}
              />
            </div>
          </div>
        </Card>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap flex items-center gap-2 ${
                  selectedCategory === category.id ? 'bg-blue-600 text-white' : 'bg-white'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                  {language === 'ta' ? category.name_ta : category.name_en}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-4">
          <p className={`text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' 
              ? `${filteredProducts.length} பொருட்கள் கண்டுபிடிக்கப்பட்டன`
              : `${filteredProducts.length} products found`
            }
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="text-gray-600"
            >
              {language === 'ta' ? 'அழி' : 'Clear'}
            </Button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className={`text-xl text-gray-600 mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' 
                ? 'பொருட்கள் கிடைக்கவில்லை'
                : 'No products found'
              }
            </p>
            <p className={`text-gray-500 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' 
                ? 'வேறு தேடல் சொற்களை முயற்சிக்கவும்'
                : 'Try different search terms'
              }
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Cart Summary */}
        <CartSummary />
      </div>
    </div>
  );
};