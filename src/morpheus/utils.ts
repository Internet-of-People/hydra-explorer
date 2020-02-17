import {
  IMorpheusAsset,
  OperationType,
  ISignedOperationsData,
  SignableOperationType,
  IAddKeyData,
  IAddRightData,
  ITombstoneDidData
} from "./interfaces";

export class OperationDetails {
  constructor(public didOperations: Map<String,String[]>, public otherOperations: String[]){}
}

export const formatMorpheusOperations = (asset: IMorpheusAsset): OperationDetails => {
  const didOperations: Map<String,String[]> = new Map();
  const otherOperations = [];

  if(!asset) {
    return new OperationDetails(didOperations, otherOperations);
  }

  for(const attempt of asset.operationAttempts) {
    if(attempt.operation === OperationType.Signed) {
      for(const signable of (attempt as ISignedOperationsData).signables) {
        if(
          signable.operation === SignableOperationType.AddKey ||
          signable.operation === SignableOperationType.RevokeKey
        ) {
          const did = (signable as IAddKeyData).did;
          if(!didOperations.has(did)){
            didOperations.set(did, []);
          }
          didOperations.get(did).push(signable.operation);
        }
        else if(
          signable.operation === SignableOperationType.AddRight ||
          signable.operation === SignableOperationType.RevokeRight
        ) {
          const did = (signable as IAddRightData).did;
          if(!didOperations.has(did)){
            didOperations.set(did, []);
          }
          didOperations.get(did).push(`${signable.operation} / ${(signable as IAddRightData).right}`);
        }
        else if(signable.operation === SignableOperationType.TombstoneDid) {
          const did = (signable as ITombstoneDidData).did;
          if(!didOperations.has(did)){
            didOperations.set(did, []);
          }
          didOperations.get(did).push(signable.operation);
        }
        else {
          otherOperations.push(signable.operation);
        }
      }
    }
    else {
      otherOperations.push(attempt.operation);
    }
  }

  return new OperationDetails(didOperations, otherOperations);
};

export const isMorpheusTransaction = (type: number, typeGroup: number): boolean => {
  return typeGroup === 4242 && type === 1;
};
