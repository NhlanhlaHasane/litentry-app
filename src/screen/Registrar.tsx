import React, {useContext} from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import ScreenNavigation from 'layout/ScreenNavigation';
import SafeView from 'presentational/SafeView';
import NetworkItem from 'presentational/NetworkItem';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {Text, Layout, Divider, Button} from '@ui-kitten/components';
import ScannerContextProvider, {ScannerContext} from 'context/ScannerContext';
import InAppNotificationContextProvider, {
  InAppNotificationContext,
  RichTextComponent,
} from 'context/InAppNotificationContext';
import NetworkSelectionContextProvider, {
  NetworkSelectionContext,
} from 'context/NetworkSelectionContext';
import ChainApiContextProvider, {
  ChainApiContext,
} from 'context/ChainApiContext';

type PropTypes = {navigation: DrawerNavigationProp<{}>};

function RegistrarScreen({navigation}: PropTypes) {
  const {currentNetwork, selectNetwork} = useContext(NetworkSelectionContext);
  const {scan, data} = useContext(ScannerContext);
  const {trigger} = useContext(InAppNotificationContext);
  const {status} = useContext(ChainApiContext);

  const renderTitle = () => {
    return (
      <TouchableOpacity onPress={selectNetwork}>
        <Layout style={styles.titleContainer}>
          <Text category="s1">Litentry</Text>
          {currentNetwork ? <NetworkItem item={currentNetwork} /> : null}
        </Layout>
      </TouchableOpacity>
    );
  };

  return (
    <SafeView>
      <ScreenNavigation
        onMenuPress={() => navigation.openDrawer()}
        renderTitle={renderTitle}
      />
      <Divider />
      <Layout style={styles.container} level="1">
        <Text category="label">Here comes the main content of Registrar</Text>
        {data.result ? <Text>{data.result.data}</Text> : null}
        <Button onPress={scan}>Scan</Button>
        <Button
          onPress={() => trigger({type: 'TextInfo', opts: {text: 'Whatnot'}})}>
          Show Notification
        </Button>
        <Button
          onPress={() =>
            trigger({
              type: 'Component',
              renderContent: () => (
                <RichTextComponent
                  title="Tx detected"
                  message="aa very long string[a very long string[a very long string[a very long string[a very long string[]]]]]a very long string[]a very long string[a very long string[a very long string[a very long string[a very long string[]]]]]a very long string[] very long string[a very long string[a very long string[a very long string[a very long string[]]]]]a very long string[]"
                />
              ),
            })
          }>
          Show Notification
        </Button>
        <Button>{status}</Button>
      </Layout>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
});

export default function WithContext(props: PropTypes) {
  return (
    <NetworkSelectionContextProvider>
      <ChainApiContextProvider>
        <InAppNotificationContextProvider>
          <ScannerContextProvider>
            <RegistrarScreen {...props} />
          </ScannerContextProvider>
        </InAppNotificationContextProvider>
      </ChainApiContextProvider>
    </NetworkSelectionContextProvider>
  );
}
