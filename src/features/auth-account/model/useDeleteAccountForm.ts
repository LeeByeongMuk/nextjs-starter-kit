import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  DELETE_ACCOUNT_DEFAULT_VALUES,
  type DeleteAccountFormInput,
  DeleteAccountFormSchema,
} from './form';

/** 회원 탈퇴 사유 입력을 빈 값으로 초기화하고 폼 스키마로 검증한다. */
export default function useDeleteAccountForm() {
  return useForm<DeleteAccountFormInput>({
    defaultValues: DELETE_ACCOUNT_DEFAULT_VALUES,
    resolver: zodResolver(DeleteAccountFormSchema),
  });
}
