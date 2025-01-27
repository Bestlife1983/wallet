import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as LocalAuthentication from 'expo-local-authentication';

import { InlineKeyboardProps, KeyProps } from './InlineKeyboard.interface';
import * as S from './InlineKeyboard.style';
import { detectBiometryType, triggerSelection } from '$utils';
import { Icon } from '../Icon/Icon';

const Key: FC<KeyProps> = (props) => {
  const { onPress, children, disabled } = props;
  const [isPressed, setPressed] = useState(false);
  const animValue = useSharedValue(0);

  const handlePressIn = useCallback(() => {
    setPressed(true);
  }, []);

  const handlePressOut = useCallback(() => {
    setPressed(false);
  }, []);

  useEffect(() => {
    animValue.value = withTiming(isPressed ? 1 : 0, {
      duration: 50,
      easing: Easing.linear,
    });
  }, [animValue, isPressed]);

  const style = useAnimatedStyle(() => {
    return {
      opacity: animValue.value,
      transform: [
        {
          scale: interpolate(animValue.value, [0, 1], [0.75, 1]),
        },
      ],
    };
  });

  return (
    <S.Key
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <S.KeyCircle style={style} />
      <S.KeyContent>{children}</S.KeyContent>
    </S.Key>
  );
};

export const InlineKeyboard: FC<InlineKeyboardProps> = (props) => {
  const {
    value,
    onChange,
    disabled = false,
    biometryEnabled = false,
    onBiometryPress,
  } = props;
  const [biometryType, setBiometryType] = useState(-1);

  useEffect(() => {
    if (biometryEnabled) {
      LocalAuthentication.supportedAuthenticationTypesAsync().then((types) => {
        const type = detectBiometryType(types);
        if (type) {
          setBiometryType(type);
        }
      });
    } else {
      setBiometryType(-1);
    }
  }, [biometryEnabled]);

  const handlePress = useCallback(
    (num: number) => () => {
      triggerSelection();
      onChange(`${value}${num}`);
    },
    [onChange, value],
  );

  const handleBackspace = useCallback(() => {
    triggerSelection();
    onChange(value.substr(0, value.length - 1));
  }, [onChange, value]);

  const nums = useMemo(() => {
    let result = [];

    for (let i = 0; i < 3; i++) {
      let line = [];
      for (let j = 0; j < 3; j++) {
        const num = j + 1 + i * 3;
        line.push(
          <Key key={`${num}`} onPress={handlePress(num)} disabled={disabled}>
            <S.KeyLabel>{num}</S.KeyLabel>
          </Key>,
        );
      }

      result.push(<S.Line key={i}>{line}</S.Line>);
    }

    let biometryButton = <Key disabled />;
    if (biometryType === LocalAuthentication.AuthenticationType.FINGERPRINT) {
      biometryButton = (
        <Key disabled={disabled} onPress={onBiometryPress}>
          <Icon name="ic-fingerprint-36" color="foregroundPrimary" />
        </Key>
      );
    } else if (
      biometryType === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
    ) {
      biometryButton = (
        <Key disabled={disabled} onPress={onBiometryPress}>
          <Icon name="ic-faceid-36" color="foregroundPrimary" />
        </Key>
      );
    }

    result.push(
      <S.Line key="last">
        {biometryButton}
        <Key onPress={handlePress(0)} disabled={disabled}>
          <S.KeyLabel>0</S.KeyLabel>
        </Key>
        <Key onPress={handleBackspace} disabled={disabled}>
          <Icon name="ic-delete-36" color="foregroundPrimary" />
        </Key>
      </S.Line>,
    );

    return result;
  }, [biometryType, disabled, handleBackspace, onBiometryPress, handlePress]);

  return <S.Wrap>{nums}</S.Wrap>;
};
