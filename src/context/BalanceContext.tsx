import React, {createContext, useContext, useMemo, useCallback, useRef, useEffect, useState} from 'react';
import {Modalize} from 'react-native-modalize';
import {Layout, Button, Divider} from '@ui-kitten/components';
import globalStyles from 'src/styles';
import {ChainApiContext} from './ChainApiContext';
import {AccountInfo} from '@polkadot/types/interfaces';
import ModalTitle from 'presentational/ModalTitle';
import {NetworkContext} from './NetworkContext';
import Balances from 'presentational/Balances';
import {useAccounts} from 'src/context/AccountsContext';

type BalanceContextValueType = {
  show: () => void;
};
export const BalanceContext = createContext<BalanceContextValueType>({
  show: () => undefined,
});

type PropTypes = {
  children: React.ReactNode;
};

export default function BalanceContextProvider({children}: PropTypes) {
  const {api} = useContext(ChainApiContext);
  const {currentNetwork} = useContext(NetworkContext);
  const {accounts} = useAccounts();
  const [balance, setBalance] = useState<AccountInfo | null>(null);

  const modalRef = useRef<Modalize>(null);
  const currentAccount = accounts[0]; // TODO: change this after adding multi account suppport

  useEffect(() => {
    let localUnsub: () => void | null;
    if (api && currentAccount) {
      api?.query.system
        .account(currentAccount.address, (accountInfo) => {
          setBalance(accountInfo);
        })
        .then((unsub) => {
          localUnsub = unsub;
        });
    }

    return () => {
      localUnsub && localUnsub();
    };
  }, [api, currentAccount]);

  const show = useCallback(() => {
    modalRef.current?.open();
  }, []);
  const value = useMemo(
    () => ({
      show,
    }),
    [show],
  );

  return (
    <BalanceContext.Provider value={value}>
      <>
        {children}
        {currentAccount && (
          <Modalize
            ref={modalRef}
            threshold={250}
            scrollViewProps={{showsVerticalScrollIndicator: false}}
            adjustToContentHeight
            handlePosition="outside"
            closeOnOverlayTap
            panGestureEnabled>
            {balance && (
              <Layout level="1" style={globalStyles.paddedContainer}>
                <ModalTitle title={currentAccount.name} subtitle={` (@${currentNetwork.name})`} />
                <Divider />
                <Balances balance={balance} />
                <Divider style={globalStyles.divider} />
                <Button appearance="ghost" onPress={() => modalRef.current?.close()}>
                  Close
                </Button>
              </Layout>
            )}
          </Modalize>
        )}
      </>
    </BalanceContext.Provider>
  );
}
