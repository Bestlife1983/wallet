import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { useDispatch } from 'react-redux';

import { SetupBiometryProps } from './SetupBiometry.interface';
import * as S from './SetupBiometry.style';
import { Button, NavBar, Text } from '$uikit';
import { ns, platform } from '$utils';
import { openSetupNotifications, openSetupWalletDone } from '$navigation';
import { walletActions } from '$store/wallet';
import { t } from '@tonkeeper/shared/i18n';
import { Steezy } from '@tonkeeper/uikit';
import { tk } from '$wallet';

const LottieFaceId = require('$assets/lottie/faceid.json');
const LottieTouchId = require('$assets/lottie/touchid.json');

export const SetupBiometry: FC<SetupBiometryProps> = ({ route }) => {
  const { pin, biometryType } = route.params;

  const dispatch = useDispatch();

  const { bottom: bottomInset } = useSafeAreaInsets();
  const iconRef = useRef<LottieView>(null);
  const isTouchId =
    biometryType !== LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION;
  const [isLoading, setLoading] = useState(false);

  useMemo(() => {
    const timer = setTimeout(() => {
      iconRef.current?.play();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const [isCreatingWallet, setCreatingWallet] = useState(false);

  const doCreateWallet = useCallback(
    (isBiometryEnabled: boolean) => () => {
      if (isCreatingWallet) {
        return;
      }

      setCreatingWallet(true);
      dispatch(
        walletActions.createWallet({
          isBiometryEnabled,
          pin,
          onDone: async (identifiers) => {
            if (tk.wallet.notifications.isAvailable) {
              openSetupNotifications(identifiers);
            } else {
              openSetupWalletDone(identifiers);
            }
            setCreatingWallet(false);
          },
          onFail: () => {
            setCreatingWallet(false);
            setLoading(false);
          },
        }),
      );
    },
    [isCreatingWallet, dispatch, pin],
  );

  const biometryNameGenitive = useMemo(() => {
    return isTouchId
      ? t(`platform.${platform}.fingerprint_genitive`)
      : t(`platform.${platform}.face_recognition_genitive`);
  }, [isTouchId]);

  const biometryName = useMemo(() => {
    return isTouchId
      ? t(`platform.${platform}.fingerprint`)
      : t(`platform.${platform}.face_recognition`);
  }, [isTouchId]);

  const handleEnable = useCallback(() => {
    setLoading(true);
    doCreateWallet(true)();
  }, [doCreateWallet]);

  return (
    <>
      <NavBar
        rightContent={
          <Button
            size="navbar_small"
            mode="secondary"
            style={{ marginRight: ns(16) }}
            onPress={doCreateWallet(false)}
            disabled={isCreatingWallet}
          >
            {t('later')}
          </Button>
        }
      />
      <S.Wrap>
        <S.Content>
          <LottieView
            style={styles.lottieIcon.static}
            ref={iconRef}
            source={isTouchId ? LottieTouchId : LottieFaceId}
            loop={false}
            autoPlay={false}
          />
          <Text variant="h2" textAlign="center">
            {t('setup_biometry_title', { biometryType: biometryNameGenitive })}
          </Text>
          <S.CaptionWrapper>
            <Text color="foregroundSecondary" textAlign="center" variant="body1">
              {t('setup_biometry_caption', {
                biometryType: isTouchId
                  ? t(`platform.${platform}.capitalized_fingerprint`)
                  : t(`platform.${platform}.capitalized_face_recognition`),
              })}
            </Text>
          </S.CaptionWrapper>
        </S.Content>
        <S.Footer style={{ paddingBottom: bottomInset }}>
          <Button
            onPress={handleEnable}
            isLoading={isLoading}
            disabled={isCreatingWallet}
          >
            {t('setup_biometry_enable_button', {
              biometryType: biometryName,
            })}
          </Button>
        </S.Footer>
      </S.Wrap>
    </>
  );
};

const styles = Steezy.create({
  lottieIcon: {
    width: 160,
    height: 160,
  },
});
