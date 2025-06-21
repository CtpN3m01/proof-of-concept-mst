import { createThirdwebClient } from "thirdweb";

export const client = createThirdwebClient({
  // use clientId for client side usage
  clientId: process.env.NEXT_PUBLIC_TW_CLIENT_ID!,

});