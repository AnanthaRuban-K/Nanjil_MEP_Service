// src/components/hooks/use-toast.ts
"use client";

import * as React from "react";

export interface ToasterToast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  open?: boolean;
}

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 1000000;

type State = {
  toasts: ToasterToast[];
};

const memoryState: State = { toasts: [] };
let listeners: Array<(state: State) => void> = [];

type Action =
  | {
      type: "ADD_TOAST";
      toast: ToasterToast;
    }
  | {
      type: "UPDATE_TOAST";
      toast: Partial<ToasterToast> & Pick<ToasterToast, "id">;
    }
  | {
      type: "DISMISS_TOAST";
      toastId?: ToasterToast["id"];
    }
  | {
      type: "REMOVE_TOAST";
      toastId?: ToasterToast["id"];
    };

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const reducer = (state: ToasterToast[], action: Action): ToasterToast[] => {
  switch (action.type) {
    case "ADD_TOAST":
      return [action.toast, ...state].slice(0, TOAST_LIMIT);

    case "UPDATE_TOAST":
      return state.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t
      );

    case "DISMISS_TOAST": {
      const { toastId } = action;
      return state.map((t) =>
        t.id === toastId || toastId === undefined 
          ? { ...t, open: false } 
          : t
      );
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return [];
      }
      return state.filter((t) => t.id !== action.toastId);
  }
};

const dispatch = (action: Action) => {
  memoryState.toasts = reducer(memoryState.toasts, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
};

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const toast = React.useCallback(
    (props: Omit<ToasterToast, "id">) => {
      const id = genId();

      const update = (props: ToasterToast) =>
        dispatch({
          type: "UPDATE_TOAST",
          toast: { ...props, id },
        });

      const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

      dispatch({
        type: "ADD_TOAST",
        toast: {
          ...props,
          id,
          open: true,
        },
      });

      return {
        id: id,
        dismiss,
        update,
      };
    },
    []
  );

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

// Export a function version of toast for use outside components
function toast(props: Omit<ToasterToast, "id">) {
  const id = genId();
  
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
    },
  });

  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
  };
}

export { useToast, toast };