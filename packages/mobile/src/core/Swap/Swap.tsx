import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { StonfiInjectedObject } from './types';
import { openSignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';
import { getTimeSec } from '$utils/getTimeSec';
import { useNavigation } from '@tonkeeper/router';
import * as S from './Swap.style';
import { Icon } from '$uikit';
import { getDomainFromURL } from '$utils';
import { logEvent } from '@amplitude/analytics-browser';
import { checkIsTimeSynced } from '$navigation/hooks/useDeeplinkingResolvers';
import { useWebViewBridge } from '$hooks/jsBridge';
import { useWallet } from '@tonkeeper/shared/hooks';
import { config } from '$config';
import { tk } from '$wallet';

interface Props {
  jettonAddress?: string;
  ft?: string;
  tt?: string;
}

export const Swap: FC<Props> = (props) => {
  const { jettonAddress } = props;

  const baseUrl = config.get('stonfiUrl', tk.wallet.isTestnet);

  const url = useMemo(() => {
    const ft = props.ft ?? jettonAddress ?? 'TON';
    const tt = props.tt ?? (jettonAddress ? 'TON' : null);

    let path = `${baseUrl}?ft=${ft}`;

    if (tt) {
      path += `&tt=${tt}`;
    }

    return path;
  }, [baseUrl, jettonAddress, props.ft, props.tt]);

  const wallet = useWallet();

  const address = wallet?.address.ton.friendly;

  const nav = useNavigation();

  const bridgeObject = useMemo(
    (): StonfiInjectedObject => ({
      address,
      close: () => nav.goBack(),
      sendTransaction: (request) =>
        new Promise((resolve, reject) => {
          const { valid_until } = request;

          if (!checkIsTimeSynced()) {
            reject();

            return;
          }

          if (valid_until < getTimeSec()) {
            reject();

            return;
          }

          openSignRawModal(
            request,
            {
              expires_sec: valid_until,
              response_options: {
                broadcast: false,
              },
            },
            resolve,
            reject,
            false,
            false,
          );
        }),
    }),
    [address, nav],
  );

  const [ref, injectedJavaScriptBeforeContentLoaded, onMessage] =
    useWebViewBridge<StonfiInjectedObject>(bridgeObject, 'tonkeeperStonfi');

  const [overlayVisible, setOverlayVisible] = useState(true);

  const handleLoadEnd = useCallback(() => {
    setTimeout(() => setOverlayVisible(false), 300);
  }, []);

  useEffect(() => {
    logEvent('swap_open', { token: jettonAddress ?? 'TON' });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <S.Container>
      <S.Browser
        ref={ref}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        source={{
          uri: url,
        }}
        onLoadEnd={handleLoadEnd}
        startInLoadingState={true}
        originWhitelist={[`https://${getDomainFromURL(baseUrl)}`]}
        decelerationRate="normal"
        javaScriptCanOpenWindowsAutomatically
        mixedContentMode="always"
        hideKeyboardAccessoryView
        thirdPartyCookiesEnabled={true}
        keyboardDisplayRequiresUserAction={false}
        mediaPlaybackRequiresUserAction={false}
      />
      {overlayVisible ? (
        <S.Overlay>
          <S.BackButtonContainer onPress={nav.goBack}>
            <S.BackButton>
              <Icon name="ic-close-16" color="foregroundPrimary" />
            </S.BackButton>
          </S.BackButtonContainer>
        </S.Overlay>
      ) : null}
    </S.Container>
  );
};
