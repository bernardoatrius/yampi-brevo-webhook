export default async function handler(req, res) {
  // 1. Aceitar apenas requisições POST da Yampi
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const payload = req.body;

    // 2. Extrair dados do cliente enviados no webhook da Yampi
    const email = payload.customer?.email || payload.resource?.customer?.data?.email;
    const name = payload.customer?.name || payload.resource?.customer?.data?.name || 'Cliente';

    if (!email) {
      return res.status(400).json({ error: 'E-mail não fornecido no payload' });
    }

    // 3. Enviar o contato para a Brevo via API (Adiciona à Lista)
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        attributes: { FIRSTNAME: name.split(' ')[0] },
        listIds: [2], // Subsitua pelo ID da sua lista na Brevo
        updateEnabled: true,
      }),
    });

    if (!brevoResponse.ok) {
      const errorText = await brevoResponse.text();
      console.error('Erro Brevo:', errorText);
      return res.status(500).json({ error: 'Falha ao integrar com Brevo' });
    }

    return res.status(200).json({ success: true, message: 'Contato enviado para a Brevo!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
