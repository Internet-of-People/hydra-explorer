export interface IMorpheusAsset {
  operationAttempts: IOperationData[];
}

export enum OperationType {
  Signed = "signed",
  RegisterBeforeProof = "registerBeforeProof",
}

export enum SignableOperationType {
  AddKey = "addKey",
  RevokeKey = "revokeKey",
  AddRight = "addRight",
  RevokeRight = "revokeRight",
  TombstoneDid = "tombstoneDid",
}

export interface IOperationData {
  operation: OperationType;
}

export interface ISignableOperationData {
  did: Did;
  lastTxId: TransactionId | null;
  operation: SignableOperationType;
}

export type PublicKeyData = string;
export type SignatureData = string;

export interface ISignedOperationsData extends IOperationData {
  signables: ISignableOperationData[];
  signerPublicKey: PublicKeyData;
  signature: SignatureData;
}

export interface IRegisterBeforeProofData extends IOperationData {
  contentId: string;
}

export type Did = string;
export type TransactionId = string;
export type AuthenticationData = string;

export type Right = string;
export const ALL_RIGHTS = [ 'impersonate', 'update' ];

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
  auth: AuthenticationData;
  expiresAtHeight?: number;
}

/**
 * Data transfer object of RevokeKey.
 */
export interface IRevokeKeyData extends ISignableOperationData {
  auth: AuthenticationData;
}

/**
 * Data transfer object of AddRight.
 */
export interface IAddRightData extends ISignableOperationData {
  auth: AuthenticationData;
  right: Right;
}

/**
 * Data transfer object of RevokeRight.
 */
export interface IRevokeRightData extends ISignableOperationData {
  auth: AuthenticationData;
  right: Right;
}

/**
 * Data transfer object of Tombstone.
 */
/* eslint @typescript-eslint/no-empty-interface:0 */
export interface ITombstoneDidData extends ISignableOperationData {
}

export interface DidOperation {
  transactionId: string;
  blockHeight: number;
  data: ISignableOperationData;
  valid: boolean;
}
