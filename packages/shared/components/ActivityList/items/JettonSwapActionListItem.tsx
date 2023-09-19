import { Address, ActionItem, ActionType, AmountFormatter } from '@tonkeeper/core';
import { ActionStatusEnum } from '@tonkeeper/core/src/TonAPI';
import { formatTransactionTime } from '../../../utils/date';
import { ActionListItem } from '../ActionListItem';
import { View, StyleSheet } from 'react-native';
import { formatter } from '../../../formatter';
import { Text } from '@tonkeeper/uikit';
import { memo, useMemo } from 'react';
import { t } from '../../../i18n';
import { useHideableFormatter } from '@tonkeeper/mobile/src/core/HideableAmount/useHideableFormatter';

interface JettonSwapActionListItemProps {
  action: ActionItem<ActionType.JettonSwap>;
}

export const JettonSwapActionListItem = memo<JettonSwapActionListItemProps>((props) => {
  const { action } = props;
  const { payload } = action;
  const { formatNano } = useHideableFormatter();

  const subtitle = payload.user_wallet.name
    ? payload.user_wallet.name
    : Address.parse(payload.user_wallet.address).toShort();

  const amountIn = useMemo(() => {
    if (payload.ton_in) {
      return formatNano(payload.ton_in, {
        prefix: AmountFormatter.sign.minus,
        postfix: 'TON',
      });
    } else if (payload.jetton_master_in) {
      return formatNano(payload.amount_in, {
        decimals: payload.jetton_master_in.decimals,
        postfix: payload.jetton_master_in.symbol,
        prefix: AmountFormatter.sign.minus,
      });
    } else {
      return '-';
    }
  }, [payload]);

  const amountOut = useMemo(() => {
    if (payload.ton_out) {
      return formatNano(payload.ton_out, {
        prefix: AmountFormatter.sign.plus,
        postfix: 'TON',
      });
    } else if (payload.jetton_master_out) {
      return formatNano(payload.amount_out, {
        decimals: payload.jetton_master_out.decimals,
        postfix: payload.jetton_master_out.symbol,
        prefix: AmountFormatter.sign.plus,
      });
    } else {
      return '-';
    }
  }, [payload]);

  return (
    <ActionListItem
      iconName="ic-swap-horizontal-alternative-28"
      title={t('transactions.swap')}
      subtitle={subtitle}
      value={amountOut}
      action={action}
      ignoreFailed
      greenValue
      subvalue={
        <Text type="label1" style={styles.amountOut}>
          {amountIn}
        </Text>
      }
    >
      <View style={styles.content}>
        <View style={styles.flex}>
          {action.status === ActionStatusEnum.Failed && (
            <Text type="body2" color="accentOrange">
              {t('transactions.failed')}
            </Text>
          )}
        </View>
        <View>
          <Text style={styles.timeText} type="body2" color="textSecondary">
            {formatTransactionTime(new Date(action.event.timestamp * 1000))}
          </Text>
        </View>
      </View>
    </ActionListItem>
  );
});

const styles = StyleSheet.create({
  timeText: {
    textAlign: 'right',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  amountOut: {
    textAlign: 'right',
    marginTop: -3,
    marginBottom: -1.5,
  },
});