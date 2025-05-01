import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale = 'pl'}) => {
  return {
    locale: locale as string,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
