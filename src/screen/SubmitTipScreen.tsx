import React, {useReducer} from 'react';
import {StyleSheet, View} from 'react-native';
import {useQueryClient} from 'react-query';
import {NavigationProp} from '@react-navigation/native';
import {Button, Card, Input, Text} from '@ui-kitten/components';
import Padder from 'presentational/Padder';
import SafeView, {noTopEdges} from 'presentational/SafeView';
import {SelectAccount} from 'presentational/SelectAccount';
import {DashboardStackParamList} from 'src/navigation/navigation';
import globalStyles, {standardPadding} from 'src/styles';
import {useApiTx} from 'src/api/hooks/useApiTx';

export function SubmitTipScreen({navigation}: {navigation: NavigationProp<DashboardStackParamList>}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const startTx = useApiTx();
  const queryClient = useQueryClient();

  const valid = state.account && state.beneficiary && state.reason && state.reason.length > 4;

  return (
    <SafeView edges={noTopEdges}>
      <View style={styles.container}>
        <View style={globalStyles.flex}>
          <Card
            disabled
            header={(p) => (
              <View {...p}>
                <Text>Sending from</Text>
              </View>
            )}>
            <SelectAccount onSelect={(payload) => dispatch({type: 'SET_ACCOUNT', payload})} selected={state.account} />
          </Card>

          <Padder scale={1.5} />
          <Text>beneficiary</Text>
          <Padder scale={0.5} />
          <Input
            placeholder={'beneficiary'}
            value={state.beneficiary}
            onChangeText={(payload) => dispatch({type: 'SET_BENEFICIARY', payload})}
          />
          {state.error === 'beneficiary_error' && <Text status="danger">{'Please enter a valid beneficiary!'}</Text>}
          <Padder scale={1.5} />
          <Text>Tip reason</Text>
          <Padder scale={0.5} />
          <Input
            placeholder={'Tip reason'}
            value={state.reason}
            onChangeText={(payload) => dispatch({type: 'SET_REASON', payload})}
          />
        </View>

        <Button
          disabled={!valid}
          onPress={() => {
            if (state.account) {
              startTx({
                address: state.account,
                txMethod: 'tips.reportAwesome',
                params: [state.reason, state.beneficiary],
              })
                .then(() => {
                  queryClient.invalidateQueries('tips');
                  navigation.goBack();
                })
                .catch((e: Error) => {
                  if (e.message.includes('failed on who')) {
                    dispatch({type: 'SET_ERROR', payload: 'beneficiary_error'});
                  }
                  console.warn(e);
                });
            }
          }}>
          Sign and Submit
        </Button>
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: standardPadding * 2, paddingBottom: standardPadding * 4},
  rowContainer: {flexDirection: 'row', alignItems: 'center'},
});

type Action =
  | {type: 'SET_BENEFICIARY'; payload: string}
  | {type: 'SET_ACCOUNT'; payload: string}
  | {
      type: 'SET_REASON';
      payload: string;
    }
  | {type: 'SET_ERROR'; payload: State['error']};

type State = {
  account?: string;
  beneficiary: string;
  reason: string;
  error?: 'beneficiary_error';
};

const initialState: State = {reason: '', beneficiary: ''};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ACCOUNT':
      return {...state, account: action.payload};
    case 'SET_BENEFICIARY':
      return {...state, beneficiary: action.payload, error: undefined};
    case 'SET_REASON':
      return {...state, reason: action.payload};
    case 'SET_ERROR':
      return {...state, error: action.payload};
    default:
      return state;
  }
}
