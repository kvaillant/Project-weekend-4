import { HttpException, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as MyERC20Votes from './assets/MyERC20Votes.json';
import * as TokenizedBallot from './assets/TokenizedBallot.json';

const MYERC20Votes_ADDRESS = '0xbed2b6c106a1b60d1a63fd71a4bc24cb8d8808cc';
const TokenizedBallot_ADDRESS = '0x79aa6c0376a693d66ec6c7347c9c1e19a9f7d283';
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

export class TokenRequest {
  message: string;
  signature: string;
}
@Injectable()
export class AppService {
  signer: ethers.Wallet;
  provider: ethers.providers.BaseProvider;
  database: PaymentOrder[];
  myERC20VotesContract: ethers.Contract;
  tokenizedBallotContract: ethers.Contract;
  constructor() {
    this.provider = ethers.getDefaultProvider('goerli');
    const myERC20VotesContract = new ethers.Contract(
      MYERC20Votes_ADDRESS,
      MyERC20Votes.abi,
      this.provider,
    );
    this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    this.myERC20VotesContract = myERC20VotesContract.connect(this.signer);
    this.tokenizedBallotContract = new ethers.Contract(
      TokenizedBallot_ADDRESS,
      TokenizedBallot.abi,
      this.provider,
    );
    this.database = [];
  }
  getTokenAddress() {
    return { address: MYERC20Votes_ADDRESS };
  }
  getBallotContractAddress() {
    return { address: TokenizedBallot_ADDRESS };
  }
  async getTotalSupply() {
    const totalSupplyBN = await this.myERC20VotesContract.totalSupply();
    const totalSupply = ethers.utils.formatEther(totalSupplyBN);
    return { result: totalSupply };
  }

  async getAllownace(from: string, to: string) {
    const allowanceBN = await this.myERC20VotesContract.allowance(from, to);
    const allowance = ethers.utils.formatEther(allowanceBN);
    return allowance;
  }

  async mintTokens(to: string, amt: number) {
    // mint new tokens here!
    const tx = await this.myERC20VotesContract.mint(
      to,
      ethers.utils.parseEther(amt.toString()),
    );
    return tx;
  }

  async delegate(to: string) {
    // delegate voting power here!
    const tx = await this.myERC20VotesContract.delegate(to);
    return tx;
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
    const tx = await this.myERC20VotesContract.mint(
      body.address,
      ethers.utils.parseEther(element.amount.toString()),
    );
    return tx;
  }

  async requestTokens(body: TokenRequest) {
    const { message, signature } = body;
    console.info({ message, signature });
    let address: string;
    try {
      address = ethers.utils.verifyMessage(message, signature); //
    } catch (err) {
      return {
        result: false,
      };
    }
    const tx = await this.myERC20VotesContract.mint(
      address,
      ethers.utils.parseEther('1.0'),
    );
    return {
      result: true,
    };
  }

  async getVoteBalance(address: string) {
    const voteBalance = await this.myERC20VotesContract.getVotes(address);
    return ethers.utils.formatEther(voteBalance);
  }

  async vote(proposal: number, amt: number) {
    // vote here!
    const tx = await this.tokenizedBallotContract.vote(
      proposal,
      ethers.utils.parseEther(amt.toString()),
    );
    return tx;
  }

  async getVotePower(address: string) {
    // get vote power here!
    const votePower = await this.tokenizedBallotContract.votePower(address);
    return ethers.utils.formatEther(votePower);
  }

  /**
   * {"id": "001", "secret":"secret", "amount":1234.0}
   * {"id": "001", "secret":"secret", "address":"0x7BBf8A7971F5459b738ef2E1698aE4459EA535F7"}
   */
}
