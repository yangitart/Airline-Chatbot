export type BaseLoadingState = {
  isLoading: boolean;
  error: null;
  data: null;
  isEmpty?: boolean;
};

export type BaseSuccessState<T> = {
  isLoading: boolean;
  data: T | null;
  error: null;
  isEmpty?: boolean;
};

export type BaseErrorState = {
  isLoading: boolean;
  data: null;
  error: string;
  isEmpty?: boolean;
};

export type BaseEmptyState = {
  isLoading: boolean;
  isEmpty?: boolean;
  data: undefined;
  error: null;
};

export type BaseAppState<T> =
  | BaseLoadingState
  | BaseSuccessState<T>
  | BaseErrorState
  | BaseEmptyState;

// Define LoadingState as a function returning a constant object
export const LoadingState: BaseLoadingState = {
  isLoading: true,
  data: null,
  error: null,
  isEmpty: false,
};

// Define SuccessState as a function returning a constant object
export const SuccessState = <T>(data: T): BaseSuccessState<T> => ({
  isLoading: false,
  data,
  error: null,
  isEmpty: false,
});

// Define ErrorState as a function returning a constant object
export const ErrorState = (error: string): BaseErrorState => ({
  isLoading: false,
  data: null,
  isEmpty: false,
  error,
});

// Define EmptyState as a constant object
export const EmptyState: BaseEmptyState = {
  isLoading: false,
  data: undefined,
  isEmpty: true,
  error: null,
};

// Define InitialState as a constant object
export const InitialState: BaseEmptyState = {
  isLoading: false,
  data: undefined,
  isEmpty: undefined,
  error: null,
};
