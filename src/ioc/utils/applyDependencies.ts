import { interfaces } from 'inversify';
import { ApplicationContainer } from '@/src/ioc/application.container';

export const applyDependencies = (
  func: Function,
  dependencies: interfaces.ServiceIdentifier<unknown>[] = [],
) => {
  const injections = dependencies.map((dependency) =>
    ApplicationContainer.get(dependency),
  );
  return func.apply(func, injections);
};
