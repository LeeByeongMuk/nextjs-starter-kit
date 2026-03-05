import {
  DeleteAccountReq,
  DeleteAccountRes,
  UpdateAccountReq,
  UpdateAccountRes,
} from '@domains/auth/account/_types/api';
import { fetchApi } from '@shared/utils/api';

export const fetchUpdateAccount = async (req: UpdateAccountReq) => {
  return (await fetchApi('/api/users', {
    method: 'PUT',
    body: JSON.stringify(req),
  })) as UpdateAccountRes;
};

export const fetchDeleteAccount = async (req: DeleteAccountReq) => {
  const params = new URLSearchParams();
  params.append('deleted_reason', req.deleted_reason.toString());
  const url = `/api/users?${params.toString()}`;

  return (await fetchApi(url, {
    method: 'DELETE',
    body: JSON.stringify(req),
  })) as DeleteAccountRes;
};
