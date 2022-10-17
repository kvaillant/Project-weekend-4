import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService, ClaimPaymentDTO, PaymentOrder } from './app.service';
import { MintTokenDto } from './dto/mint.token.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('token-address')
  getTokenAddress() {
    return this.appService.getTokenAddress();
  }
  @Get('total-supply')
  getTotalSupply() {
    return this.appService.getTotalSupply();
  }
  @Get('allowance')
  getAllowance(@Query('from') from: string, @Query('to') to: string) {
    return this.appService.getAllownace(from, to);
  }
  @Get('transaction-by-hash/:hash')
  getTransactionByHash(@Param('hash') hash: string) {
    return this.appService.getTransactionByHash(hash);
  }
  @Get('transaction-receipt-by-hash/:hash')
  getTransactionReceiptByHash(@Param('hash') hash: string) {
    return this.appService.getTransactionReceiptByHash(hash);
  }

  @Post('create-order')
  createOrder(@Body() body: PaymentOrder) {
    this.appService.createPaymentOrder(body);
  }
  @Get('list-payment-orders')
  getListPaymentOrders() {
    return this.appService.listPaymentOrders();
  }
  @Get('get-payment-order')
  getPaymentOrder(@Query('id') id: string) {
    return this.appService.getPaymentOrderById(id);
  }
  @Post('claim-payment')
  claimPayment(@Body() body: ClaimPaymentDTO) {
    return this.appService.claimPayment(body);
  }
  @Post('request-voting-tokens')
  requestTokesn(@Body() body: any) {
    return this.appService.requestTokens(body);
  }
  @Post('mint-tokens')
  mintTokens(@Body() payload: MintTokenDto) {
    return this.appService.mintTokens(payload.to, payload.amount);
  }

  @Post('delegate')
  delegate(@Body('to') to: string) {
    return this.appService.delegate(to);
  }

  @Post('vote')
  vote(@Body('proposal') proposal: number, @Body('amt') amt: number) {
    return this.appService.vote(proposal, amt);
  }

  @Get('vote-power')
  getVotePower(@Query('address') address: string) {
    return this.appService.getVotePower(address);
  }

  @Get('vote-balance')
  getVoteBalance(@Query('address') address: string) {
    return this.appService.getVoteBalance(address);
  }
}
