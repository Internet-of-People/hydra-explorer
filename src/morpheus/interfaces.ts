export interface IMorpheusAsset {
  operationAttempts: IOperationData[];
}

export enum OperationType {
  Signed = "signed",

  RegisterBeforeProof = "registerBeforeProof",
  RevokeBeforeProof = "revokeBeforeProof",
}

export enum SignableOperationType {
  AddKey = "addKey",
  RevokeKey = "revokeKey",
  AddRight = "addRight",
  RevokeRight = "revokeRight",
  AddService = "addService",
  // TODO consider having updateService
  RemoveService = "removeService",
  TombstoneDid = "tombstoneDid",
}

export interface IOperationData {
  operation: OperationType;
}

export interface ISignableOperationData {
  operation: SignableOperationType;
}

export type PublicKeyData = string;
export type SignatureData = string;

export interface ISignedOperationsData extends IOperationData {
  signables: ISignableOperationData[];
  signerPublicKey: PublicKeyData;
  signature: SignatureData;
}
  