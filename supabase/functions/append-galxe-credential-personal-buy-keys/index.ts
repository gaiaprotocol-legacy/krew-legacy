import { responseError, serveWithOptions } from "../_shared/cors.ts";

serveWithOptions(async (req) => {
  const { walletAddress } = await req.json();
  if (!walletAddress) throw new Error("Missing wallet address");

  const accessToken = "3zvgYgciBkH1ucCx7PIx8cJyogq3Zwq2";
  const credId = "355171752783552512";
  const operation = "APPEND";
  const items = [walletAddress];

  const response = await fetch("https://graphigo.prd.galaxy.eco/query", {
    method: "POST",
    headers: {
      "access-token": accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operationName: "credentialItems",
      query: `
        mutation credentialItems($credId: ID!, $operation: Operation!, $items: [String!]!) 
          { 
            credentialItems(input: { 
              credId: $credId 
              operation: $operation 
              items: $items 
            }) 
            { 
              name 
            } 
          }
    `,
      variables: {
        credId: credId,
        operation: operation,
        items: items,
      },
    }),
  });

  if (response.status !== 200) {
    return responseError(await response.json());
  }
});
