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

export type Did = string;
export type AuthenticationData = string;

export enum Right {
  Impersonate = 'impersonate',
  Update = 'update',
}

export const ALL_RIGHTS = [ Right.Impersonate, Right.Update ];

export interface IKeyData {
  // TODO an additional "type" property should return something
  // like "KeyId-ed25519-Base58" for auth that starts with "iez"
  index: number;
  auth: AuthenticationData;
  validFromHeight: number | null;
  validUntilHeight: number | null;
  valid: boolean; // NOTE: contains derived information based on other fields and `atHeight`
}

// Not kidding: https://github.com/Microsoft/TypeScript/issues/24220
export type IRightsMap<T> = {[right in Right]: T};

export interface IKeyRightHistoryPoint {
  height: number | null;
  valid: boolean;
}

export interface IKeyRightHistory {
  keyLink: string;
  history: IKeyRightHistoryPoint[];
  valid: boolean; // NOTE: contains derived information based on other fields and `atHeight`
}

export interface IDidDocumentData {
  did: Did;
  keys: IKeyData[];
  rights: IRightsMap<IKeyRightHistory[]>; // contains key indexes from the keys property
  tombstonedAtHeight: number | null;
  tombstoned: boolean; // NOTE: contains derived information based on other fields and `atHeight`
  queriedAtHeight: number;
}

/**
 * Data transfer object of AddKey.
 */
export interface IAddKeyData extends ISignableOperationData {
  did: Did;
  auth: AuthenticationData;
  expiresAtHeight?: number;
}

/**
 * Data transfer object of RevokeKey.
 */
export interface IRevokeKeyData extends ISignableOperationData {
  did: Did;
  auth: AuthenticationData;
}

/**
 * Data transfer object of AddRight.
 */
export interface IAddRightData extends ISignableOperationData {
  did: Did;
  auth: AuthenticationData;
  right: Right;
}

/**
 * Data transfer object of RevokeRight.
 */
export interface IRevokeRightData extends ISignableOperationData {
  did: Did;
  auth: AuthenticationData;
  right: Right;
}

/**
 * Data transfer object of Tombstone.
 */
export interface ITombstoneDidData extends ISignableOperationData {
  did: Did;
}

export interface DidOperation {
  transactionId: string;
  blockHeight: number;
  data: ISignableOperationData;
  valid: boolean;
}
