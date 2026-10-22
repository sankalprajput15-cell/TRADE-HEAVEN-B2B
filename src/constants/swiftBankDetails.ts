export interface SwiftBankDetails {
  accountHolderName: string;
  paymentMethod: string;
  iban: string;
  bicSwift: string;
  bankName: string;
  beneficiaryAddress: string;
  beneficiaryBankCountry: string;
  mandatoryRemark: string;
}

export const OFFICIAL_SWIFT_BANK_DETAILS: SwiftBankDetails = {
  accountHolderName: 'TRADEHEAVEN ECOM SOLUTION LLP',
  paymentMethod: 'SWIFT (International wire)',
  iban: 'GB81TCCL04140453340868',
  bicSwift: 'TCCLGB3L',
  bankName: 'The Currency Cloud Limited',
  beneficiaryAddress: '1 Sheldon Square, London, W2 6TT, United Kingdom',
  beneficiaryBankCountry: 'United Kingdom',
  mandatoryRemark: 'DO NOT CONVERT TO GBP'
};
