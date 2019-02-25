import { skipOnError, suite, timeout } from 'mocha-typescript';

import { TransactionBaseTest } from './base/TransactionBaseTest';
import { Faucet }              from '@/faucet/Faucet';

// Tests need to be done in correct order, and skipped when an error occurs
@suite(timeout(60000), skipOnError)
class VechainTransactionTest extends TransactionBaseTest {
    public chain: string = 'vechain';
    public currency: string = 'VET';
    public amount: string = '0.001';
    public gasName: string = 'VTHO';
    public walletFromMinimumBalance: number = 10;
    public walletFrom = {
        'primary': true,
        'description': 'Wild Gharial',
        'address': '0xf5875417ccEb3aF5ef691374b49021Ce7c62A55f'
    };
    public walletTo = {
        'primary': false,
        'description': 'Otherworldly Seahorse',
        'address': '0x40a5a7DaAa2830317d5C3c3c79c059F1764a8832'
    };

    public async checkFaucet() {
        return Faucet.getFaucetIfNeeded(
            this.browser,
            'vechain',
            this.getWalletBalance(this.walletFrom.address),
            this.walletFromMinimumBalance,
            this.walletFrom.address
        );
    }

    // TODO: WIP
}