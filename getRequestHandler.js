const getReqHandler=async (url, token)=>{
    try {
      const response = await fetch(url,
          {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': 'Bearer ' + token, // token,
                // 'x-kong-jwt-claim-aud': 'MOBILE'
            },
          });
      if (!response.ok) {
        funcBlock(blocker({
          flowItem: url, block2remedy:
                  `${url} api response ${response.status}, body ${response.body}.`}));
        return null;
      }
      const respData= await response.json();
      return respData;
    } catch (error) {
      funcBlock(blocker({flowItem: url, block2remedy:
                `AddressInfoWithPinCode api error: ${error.toString()}`,
      }));
      return null;
    }
  };

module.exports={getReqHandler}