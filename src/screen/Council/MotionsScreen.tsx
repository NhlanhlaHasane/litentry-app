import {Button, Divider, Icon, Layout, Text, TopNavigationAction, useTheme} from '@ui-kitten/components';
import React, {useContext, useState} from 'react';
import globalStyles, {standardPadding} from 'src/styles';
import ScreenNavigation from 'layout/ScreenNavigation';
import {NavigationProp} from '@react-navigation/native';
import {ChainApiContext} from 'context/ChainApiContext';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import type {Call} from '@polkadot/types/interfaces';
import {FunctionMetadataLatest, ProposalIndex} from '@polkadot/types/interfaces';
import {formatNumber} from '@polkadot/util';
import {useVotingStatus} from 'src/hook/useVotingStatus';
import type {DeriveCollectiveProposal} from '@polkadot/api-derive/types';
import {TxContext} from 'context/TxContext';
import {EmptyView} from 'presentational/EmptyView';
import Padder from 'presentational/Padder';
import type {IExtrinsic, IMethod} from '@polkadot/types/types';
import {Compact, GenericCall, getTypeDef} from '@polkadot/types';
import {useQuery, useQueryClient} from 'react-query';
import {Param, Params} from 'presentational/Params';
import {useAccounts} from 'context/AccountsContext';
import {useCouncilMembers} from 'src/hook/useCouncilMembers';

export function MotionsScreen({navigation}: {navigation: NavigationProp<DashboardStackParamList>}) {
  const {api} = useContext(ChainApiContext);
  const {data, refetch, isLoading} = useQuery('motions', () => api?.derive.council.proposals());

  return (
    <Layout style={globalStyles.flex}>
      <ScreenNavigation
        renderTitle={() => (
          <Text category={'s1'} style={globalStyles.monoFont}>
            Motions
          </Text>
        )}
        accessoryLeft={
          <TopNavigationAction onPress={navigation.goBack} icon={(p) => <Icon {...p} name={'arrow-back-outline'} />} />
        }
      />
      <FlatList
        refreshing={isLoading}
        onRefresh={refetch}
        style={styles.flatList}
        data={data}
        renderItem={({item}) => {
          return <Motion item={item} />;
        }}
        ItemSeparatorComponent={Divider}
        keyExtractor={(item) => item.hash.toHex()}
        ListEmptyComponent={EmptyView}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({flatList: {padding: standardPadding * 2}});

function Motion({item}: {item: DeriveCollectiveProposal}) {
  const theme = useTheme();
  const {api} = useContext(ChainApiContext);
  const {start} = useContext(TxContext);
  const {accounts} = useAccounts();
  const account = accounts?.[0];

  const {votes, proposal, hash} = item;
  const {data} = useCouncilMembers();
  const membersCount = data?.members.length ?? 0;
  const {isCloseable, isVoteable} = useVotingStatus(votes, membersCount, 'council');

  const {meta, method, section} = proposal.registry.findMetaCall(proposal.callIndex);
  const params = useParams(proposal);

  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  return (
    <View style={motionStyle.container}>
      <View style={motionStyle.mainRow}>
        <Text category={'h4'}>{formatNumber(votes?.index)}</Text>
        <TouchableOpacity onPress={() => setOpen(!open)} style={motionStyle.titleContainer}>
          <Text category={'p1'} style={motionStyle.title} numberOfLines={1}>
            {section}.{method}
          </Text>
          <Icon
            name={open ? 'arrow-up-outline' : 'arrow-down-outline'}
            style={globalStyles.icon}
            fill={theme['color-basic-600']}
          />
        </TouchableOpacity>
        {/*<Text>{formatNumber(votes?.threshold)}</Text>*/}
        <Text category={'c1'}>{`Aye ${votes?.ayes.length}/${membersCount} `}</Text>
        <Padder scale={0.5} />
        {(() => {
          if (data?.isMember) {
            if (isCloseable) {
              return (
                <View>
                  <Button
                    status={'warning'}
                    size={'tiny'}
                    onPress={() => {
                      if (api && account) {
                        start({
                          api,
                          address: account.address,
                          title: 'treasury.approveProposal',
                          description:
                            'Approve a proposal. At a later time, the proposal will be allocated to the beneficiary and the original deposit will be returned.',
                          params:
                            api.tx.council.close?.meta.args.length === 4
                              ? [hash, votes?.index, 0, 0]
                              : [hash, votes?.index],
                          txMethod: 'council.close',
                        })
                          .then(() => {
                            return queryClient.invalidateQueries('motions');
                          })
                          .catch((e) => console.warn(e));
                      }
                    }}>
                    Close
                  </Button>
                </View>
              );
            } else if (isVoteable) {
              return (
                <View style={motionStyle.buttons}>
                  <Button
                    status={'danger'}
                    size={'tiny'}
                    onPress={() => {
                      if (api && account) {
                        start({
                          api,
                          address: account.address,
                          title: 'council.vote(proposal, index, approve)',
                          description: 'Add a nay vote for the sender to the given proposal.',
                          params: [hash, votes?.index, false],
                          txMethod: 'council.vote',
                        })
                          .then(() => queryClient.invalidateQueries('motions'))
                          .catch((e) => console.warn(e));
                      }
                    }}>
                    Nay
                  </Button>
                  <Padder scale={0.5} />
                  <Button
                    status={'success'}
                    size={'tiny'}
                    onPress={() => {
                      if (api && account) {
                        start({
                          api,
                          address: account.address,
                          title: 'council.vote(proposal, index, approve)',
                          description: 'Add an aye vote for the sender to the given proposal.',
                          params: [hash, votes?.index, true],
                          txMethod: 'council.vote',
                        })
                          .then(() => queryClient.invalidateQueries('motions'))
                          .catch((e) => console.warn(e));
                      }
                    }}>
                    Aye
                  </Button>
                </View>
              );
            }
          }
        })()}
      </View>
      {open ? (
        <View style={motionStyle.footer}>
          <Text category={'c1'} style={[motionStyle.desc, {color: theme['color-basic-600']}]}>{`${formatCallMeta(
            meta,
          )}`}</Text>
          <Padder scale={1} />
          <Params data={params} />
        </View>
      ) : null}
    </View>
  );
}

const motionStyle = StyleSheet.create({
  container: {paddingVertical: standardPadding},
  mainRow: {flexDirection: 'row', alignItems: 'center'},
  titleContainer: {padding: standardPadding, flexDirection: 'row', flex: 1, alignItems: 'center'},
  title: {},
  desc: {paddingHorizontal: standardPadding},
  buttons: {display: 'flex', flexDirection: 'row'},
  footer: {paddingVertical: standardPadding, paddingHorizontal: standardPadding / 2},
});

const METHOD_TREA = ['approveProposal', 'rejectProposal'];
function useParams(proposal: Call) {
  const {api} = useContext(ChainApiContext);
  const {method, section} = proposal.registry.findMetaCall(proposal.callIndex);
  const isTreasury = section === 'treasury' && METHOD_TREA.includes(method);
  const proposalId = isTreasury ? (proposal.args[0] as Compact<ProposalIndex>).unwrap() : undefined;
  const {data: treasuryProposal} = useQuery(
    ['proposal', proposalId?.toString()],
    () => (proposalId ? api?.query.treasury.proposals(proposalId).then((p) => p.unwrapOr(undefined)) : undefined),
    {
      enabled: !!proposalId,
    },
  );
  const extractedParams = extractParams(proposal);
  if (treasuryProposal) {
    extractedParams.push({type: getTypeDef('AccountId'), value: treasuryProposal.beneficiary, name: 'beneficiary'});
    extractedParams.push({type: getTypeDef('AccountId'), value: treasuryProposal.proposer, name: 'proposer'});
    extractedParams.push({type: getTypeDef('Balance'), value: treasuryProposal.value, name: 'payout'});
  }
  return extractedParams;
}

/**
 * functions bellow help extract useful data
 * from each motion object. they are mostly loosely copied from
 * https://github.com/polkadot-js/apps/blob/master/packages/react-components/src/Call.tsx
 */

export function formatCallMeta(meta?: FunctionMetadataLatest): string {
  if (!meta || !meta.documentation.length) {
    return '';
  }

  const strings = meta.documentation.map((doc) => doc.toString().trim());
  const firstEmpty = strings.findIndex((doc) => !doc.length);
  const combined = (firstEmpty === -1 ? strings : strings.slice(0, firstEmpty))
    .join(' ')
    .replace(/#(<weight>| <weight>).*<\/weight>/, '');
  const parts = splitParts(combined.replace(/\\/g, '').replace(/`/g, ''));

  return parts.join(' ');
}

function splitSingle(value: string[], sep: string): string[] {
  return value.reduce((result: string[], value: string): string[] => {
    return value.split(sep).reduce((result: string[], value: string) => result.concat(value), result);
  }, []);
}

function splitParts(value: string): string[] {
  return ['[', ']'].reduce((result: string[], sep) => splitSingle(result, sep), [value]);
}

function extractParams(value: IExtrinsic | IMethod): Param[] {
  return GenericCall.filterOrigin(value.meta).map(
    ({name, type}, k): Param => ({
      name: name.toString(),
      type: getTypeDef(type.toString()),
      value: value.args[k],
    }),
  );
}
