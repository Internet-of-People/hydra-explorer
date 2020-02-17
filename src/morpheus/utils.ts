import { IMorpheusAsset, OperationType, ISignedOperationsData } from "./interfaces";

export const formatMorpheusOperations = (asset: IMorpheusAsset): string[] => {
  const result = [];
  for(const attempt of asset.operationAttempts) {
    if(attempt.operation === OperationType.Signed) {
      for(const signable of (attempt as ISignedOperationsData).signables) {
        result.push(`signed/${signable.operation}`);
      }
    }
    else {
      result.push(attempt.operation);
    }
  }

  return result;
};

export const isMorpheusTransaction = (type: number, typeGroup: number): boolean => {
  return typeGroup === 4242 && type === 1;
};
