import { skipOnError, slow, suite, test, timeout } from 'mocha-typescript';

import { TransactionBaseTest } from './base/TransactionBaseTest';
import { Faucet }              from '@/faucet/Faucet';

// Tests need to be done in correct order, and skipped when an error occurs
@suite(timeout(60000), skipOnError)
class GochainTransactionTest extends TransactionBaseTest {
    public chain: string = 'go';
    public currency: string = 'GO';
    public amount: string = '0.0012';
    public amountVisible: string = '0.001';
    public gasName: string = 'GWEI';
    public walletFromMinimumBalance: number = 1;
    public walletFrom = {
        primary: true,
        description: 'Imperial Butterfly',
        address: '0xF9406e4989759d4a7508279eaadD22a96F3b39d6'
    };
    public walletTo = {
        primary: false,
        description: 'Entrancing Sheep',
        address: '0x2817600A4A8508CCAF784f8C21E7Ce9974EDbC13'
    };

    public async checkFaucet() {
        return Faucet.getFaucetIfNeeded(
            this.browser,
            'gochain',
            this.getWalletBalance(this.walletFrom.address),
            this.walletFromMinimumBalance,
            this.walletFrom.address
        );
    }

    public async advancedOptions() {
        await this.advancedOptionsSliderSingleValue(2);
    }
}
