import {ApiPromise} from '@polkadot/api';
import {u8aToString} from '@polkadot/util';
import {Registration, AccountId} from '@polkadot/types/interfaces';

type Result =
  | {
      hasIdentity: true;
      hasJudgements: boolean;
      accountId: string | AccountId;
      display: string;
      registration: Registration;
    }
  | {
      hasIdentity: false;
      hasJudgements: false;
      accountId: string;
    };

export async function getAccountIdentityInfo(api: ApiPromise, accountId: string): Promise<Result> {
  const registrationOption = await api.query.identity.identityOf(accountId);
  const registration = registrationOption.unwrapOr(undefined);

  if (registration) {
    return {
      hasIdentity: true,
      hasJudgements: registration.judgements.length > 0,
      accountId,
      registration,
      display: getDisplay(registration, accountId),
    };
  }

  const superAccountDataOption = await api.query.identity.superOf(accountId);
  const superAccountData = superAccountDataOption.unwrapOr(undefined);

  if (superAccountData) {
    const [superAccountId] = superAccountData;
    const superAccountOption = await api.query.identity.identityOf(superAccountId);
    const superRegistration = superAccountOption.unwrapOr(undefined);

    if (superRegistration) {
      console.log('AAAA', u8aToString(superRegistration.info.display.asRaw));
      return {
        hasIdentity: true,
        hasJudgements: superRegistration.judgements.length > 0,
        accountId: superAccountId,
        registration: superRegistration,
        display: getDisplay(superRegistration, accountId),
      };
    }
  }

  return {hasIdentity: false, hasJudgements: false, accountId};
}

function getDisplay(registration: Registration, accountId: string) {
  return u8aToString(registration.info.display.asRaw) || accountId;
}
