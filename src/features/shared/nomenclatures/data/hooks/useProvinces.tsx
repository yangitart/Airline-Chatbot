import { useState, useCallback } from 'react';
import { Query } from "@/src/core/api/services/url.service";
import { ProvinceNomenclature } from '@/src/features/shared/nomenclatures/domain/entities/LocationNomenclature';
import { nomenclatureRepository } from "@/src/features/shared/nomenclatures/domain/repositories/NomenclaturesRepository";

export const useProvinces = () => {
  const [provinces, setProvinces] = useState<ProvinceNomenclature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProvinces = useCallback(async (request: Query) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await nomenclatureRepository.getProvinces(request);

      if (response) {
        setProvinces(response);
      } else {
        setError('No se pudieron obtener las provincias');
        setProvinces([]);
      }
    } catch (err) {
      setError('Error inesperado al obtener provincias');
      setProvinces([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    provinces,
    isLoading,
    error,
    getProvinces,
  };
};