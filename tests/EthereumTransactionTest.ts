import { skipOnError, suite, timeout } from 'mocha-typescript';

import { TransactionBaseTest } from './base/TransactionBaseTest';
import { Faucet }              from '@/faucet/Faucet';

// Tests need to be done in correct order, and skipped when an error occurs
@suite(timeout(60000), skipOnError)
class EthereumTransactionTest extends TransactionBaseTest {
    public chain: string = 'eth';
    public currency: string = 'ETH';
    public amount: string = '0.0012';
    public amountVisible: string = '0.001';
    public gasName: string = 'GWEI';
    public walletFromMinimumBalance: number = 1;
    public walletFrom = {
        primary: false,
        description: 'Inviting Kinkajou',
        address: '0x969BB561C1E6415575eeecc0b78bf5683a7371BA'
    };
    public walletTo = {
        primary: true,
        description: 'Marvelous Goosander',
        address: '0xb16355948A8448c7D4b58bb25f524f9dAE598c9C'
    };

    public async checkFaucet() {
        return Faucet.getFaucetIfNeeded(
            this.browser,
            'ethereum',
            this.getWalletBalance(this.walletFrom.address),
            this.walletFromMinimumBalance,
            this.walletFrom.address
        );
    }
}