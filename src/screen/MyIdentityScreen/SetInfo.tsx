import React, {useRef, useCallback} from 'react';
import {Dimensions, View, StyleSheet, Alert} from 'react-native';
import {Layout, Button, Divider, ListItem, Text} from '@ui-kitten/components';
import Identicon from '@polkadot/reactnative-identicon';
import {Modalize} from 'react-native-modalize';
import InfoBanner from 'presentational/InfoBanner';
import globalStyles, {standardPadding} from 'src/styles';
import Padder from 'presentational/Padder';
import IdentityInfoForm, {IdentityPayload} from 'presentational/IdentityInfoForm';
import {useApiTx} from 'src/api/hooks/useApiTx';

const {height} = Dimensions.get('window');

type PropTypes = {address: string};

function SetInfo({address}: PropTypes): React.ReactElement {
  const modalRef = useRef<Modalize>(null);
  const startTx = useApiTx();

  const handleOpenForm = useCallback(() => {
    modalRef.current?.open();
  }, []);

  const onSubmitIdentityInfo = useCallback(
    async (info: IdentityPayload) => {
      modalRef.current?.close();
      await startTx({
        address,
        txMethod: 'identity.setIdentity',
        params: [info],
      }).catch((e) => {
        Alert.alert('account/api is not ready');
        console.error(e);
      });
    },
    [address, startTx],
  );

  return (
    <>
      <Layout style={globalStyles.paddedContainer}>
        <View style={{paddingHorizontal: standardPadding * 2}}>
          <InfoBanner text="This address doesn't have any identity connected to it." inline />
        </View>
        <Padder scale={0.5} />
        <Divider />
        <Layout>
          <ListItem
            title="Address"
            accessoryLeft={() => (
              <View style={styles.identiconContainer}>
                <Identicon value={address} size={20} />
              </View>
            )}
            accessoryRight={() => (
              <Text selectable category="label" numberOfLines={1} style={styles.address} ellipsizeMode="middle">
                {address}
              </Text>
            )}
          />

          <Padder scale={1} />
          <Button onPress={handleOpenForm}>Set Identity</Button>
        </Layout>
      </Layout>

      <Modalize
        ref={modalRef}
        threshold={250}
        scrollViewProps={{showsVerticalScrollIndicator: false}}
        adjustToContentHeight
        handlePosition="outside"
        closeOnOverlayTap
        withReactModal
        useNativeDriver
        panGestureEnabled>
        <View style={styles.formContainer}>
          <IdentityInfoForm onSubmit={onSubmitIdentityInfo} />
        </View>
      </Modalize>
    </>
  );
}

export default SetInfo;

const styles = StyleSheet.create({
  identiconContainer: {paddingHorizontal: 10},
  address: {width: '50%', textAlign: 'right'},
  formContainer: {height: height * 0.8},
});
