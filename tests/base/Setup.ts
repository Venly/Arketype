import settings from '../../package.json';
import user     from '@config/user.json';

export interface Config {
    userData: any,
    capabilities: any,
    url: string
}

export class Setup {
    public static async getConfig(): Promise<Config> {
        let userInfo = await Setup.importIfExists('../../testConfig/user.local.json') || {};
        let userData = Object.assign({}, user, userInfo);

        // Input capabilities
        const capabilities = {
            'build': settings.version,
            'project': settings.name,
            'acceptSslCerts': 'true',
            'browserstack.networkLogs': 'true',
            'browserstack.local': 'true',
        };

        return {
            userData,
            capabilities,
            url: 'http://localhost:4000'
        }
    }

    private static async importIfExists(file: string): Promise<any> {
        try {
            return await require(file);
        } catch (e) {
            console.log('user.local.json not found');
            return;
        }
    }
}
