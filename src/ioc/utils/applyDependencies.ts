import { interfaces } from 'inversify';
import { ApplicationContainer } from '@/src/ioc/application.container';

export const applyDependencies = <Arguments extends unknown[], Result>(
  factory: (...args: Arguments) => Result,
  dependencies: interfaces.ServiceIdentifier<unknown>[] = [],
): Result => {
  const injections = dependencies.map((dependency) =>
    ApplicationContainer.get(dependency),
  );
  return factory(...(injections as Arguments));
};
