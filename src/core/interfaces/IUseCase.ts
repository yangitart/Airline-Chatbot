interface UseCaseResponse<T> {
  data? : T,
  error? : string
}

export interface IUseCase<A, R> {
  execute( ...args : A[] ) : R;
}
