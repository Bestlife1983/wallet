import { MainStackRouteNames } from '../navigationNames';
import { CryptoCurrency } from '$shared/constants';

export type MainStackParamList = {
  [MainStackRouteNames.Start]: {};
  [MainStackRouteNames.CreateWalletStack]: {};
  [MainStackRouteNames.ImportWalletStack]: {};
  [MainStackRouteNames.AddWatchOnlyStack]: {};
  [MainStackRouteNames.MigrationStack]: {};
  [MainStackRouteNames.Tabs]: {};
  [MainStackRouteNames.Wallet]: {
    currency: CryptoCurrency;
  };
  [MainStackRouteNames.Inscription]: {
    type: string;
    ticker: string;
  };
  [MainStackRouteNames.Subscriptions]: {};
  [MainStackRouteNames.BackupWords]: {
    mnemonic: string;
  };
  [MainStackRouteNames.DevStack]: {};
  [MainStackRouteNames.Jetton]: {
    jettonAddress: string;
  };
  [MainStackRouteNames.DeleteAccountDone]: {};
  [MainStackRouteNames.Staking]: {};
  [MainStackRouteNames.StakingPools]: {
    providerId: string;
  };
  [MainStackRouteNames.StakingPoolDetails]: {
    poolAddress: string;
  };
  [MainStackRouteNames.ManageTokens]: {};
  [MainStackRouteNames.AddressUpdateInfo]: {};
  [MainStackRouteNames.AddWatchOnlyStack]: {};
  [MainStackRouteNames.HoldersWebView]: {};
  [MainStackRouteNames.ChangePin]: {};
  [MainStackRouteNames.ResetPin]: {};
  [MainStackRouteNames.ChangePinBiometry]: {};
};
