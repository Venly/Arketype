import { skipOnError, suite, timeout } from 'mocha-typescript';

import { TransactionBaseTest } from './base/TransactionBaseTest';
import { Faucet }              from '@/faucet/Faucet';

// Tests need to be done in correct order, and skipped when an error occurs
@suite(timeout(60000), skipOnError)
class BitcoinTransactionTest extends TransactionBaseTest {
    public chain: string = 'bitcoin';
    public currency: string = 'BTC';
    public amount: string = '0.000001';
    public amountVisible: string = '0.000001';
    public gasName: string = 'Satoshi';
    public walletFromMinimumBalance: number = 0.01;
    public walletFrom = {
        "primary": false,
        "description": "Hidden Hippopotamus",
        "address": "n4d8BxWN6ERs7q2TNtD1Ktje3xWdfBHaPS"
    };
    public walletTo = {
        "primary": true,
        "description": "Spooky Hawk",
        "address": "mx3DgMQJdrhwtR8XNQs9cnyzpvVffxtArr"
    };

    public async checkFaucet() {
        return Faucet.getFaucetIfNeeded(
            this.browser,
            'bitcoin',
            this.getWalletBalance(this.walletFrom.address),
            this.walletFromMinimumBalance,
            this.walletFrom.address
        );
    }
}