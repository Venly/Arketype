import settings  from '../../package.json';
import { Utils } from '@/base/Utils';

export interface Config {
    userData: any,
    capabilities: any,
    url: string
}

export class Setup {
    public static async getConfig(): Promise<Config> {
        const env = Utils.env;

        const userData = {
            'browserstack': {
                'browserstack.user': env.BROWSERSTACK_USERNAME,
                'browserstack.key': env.BROWSERSTACK_ACCESS_KEY,
            },
            'arkane': {
                'login': env.ARKANE_USERNAME,
                'password': env.ARKANE_PASSWORD,
                'pincode': env.ARKANE_PINCODE
            }
        };


        // Input capabilities
        const capabilities = {
            'build': env.BROWSERSTACK_BUILD,
            'project': settings.name,
            'acceptSslCerts': 'true',
            'browserstack.networkLogs': 'true',
            'browserstack.local': Boolean(env.BROWSERSTACK_LOCAL),
        };

        return {
            userData,
            capabilities,
            url: env.TEST_URL
        }
    }
}
