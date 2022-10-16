import { HttpException, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as TokenJson from './assets/MyToken.json';

const CONTRACT_ADDRESS = '0x8AE3C9bf30481901ce9B5b8AEAAc214aA67ec81F';
export class PaymentOrder {
  id: string;
  secret: string;
  amount: number;
}

export class ClaimPaymentDTO {
  id: string;
  secret: string;
  address: string;
}
@Injectable()
export class AppService {
  provider: ethers.providers.BaseProvider;
  contract: ethers.Contract;
  database: PaymentOrder[];
  constructor() {
    this.provider = ethers.getDefaultProvider('goerli');
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      TokenJson.abi,
      this.provider,
    );
    this.database = [];
  }
  getTokenAddress() {
    return { address: CONTRACT_ADDRESS };
  }
  async getTotalSupply() {
    const totalSupplyBN = await this.contract.totalSupply();
    const totalSupply = ethers.utils.formatEther(totalSupplyBN);
    return { result: totalSupply };
  }

  async getAllownace(from: string, to: string) {
    const allowanceBN = await this.contract.allowance(from, to);
    const allowance = ethers.utils.formatEther(allowanceBN);
    return allowance;
  }

  async getTransactionByHash(hash: string) {
    return this.provider.getTransaction(hash);
  }

  async getTransactionReceiptByHash(hash: string) {
    const tx = await this.getTransactionByHash(hash);
    return await tx.wait();
  }
  async createPaymentOrder(body: PaymentOrder) {
    this.database.push(body);
  }

  getPaymentOrderById(id: string) {
    const element = this.database.find((entry) => entry.id);
    return element
      ? {
          id: element.id,
          amount: element.amount,
        }
      : undefined;
  }

  listPaymentOrders() {
    return this.database.map((entry) => ({
      id: entry.id,
      amount: entry.amount,
    }));
  }

  async claimPayment(body: ClaimPaymentDTO) {
    const element = this.database.find((entry) => entry.id === body.id);
    if (!element) throw new HttpException('Not Found', 404);
    if (body.secret !== element.secret) return false;
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, this.provider);
    const signedContract = this.contract.connect(signer);
    const tx = await signedContract.mint(
      body.address,
      ethers.utils.parseEther(element.amount.toString()),
    );
    return tx;
  }
  requestTokens(body: any) {
    return {
      result: true,
    };
  }
  /**
   * {"id": "001", "secret":"secret", "amount":1234.0}
   * {"id": "001", "secret":"secret", "address":"0x7BBf8A7971F5459b738ef2E1698aE4459EA535F7"}
   */
}
