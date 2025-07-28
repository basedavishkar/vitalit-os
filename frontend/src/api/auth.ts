export async function login(role: string, password: string): Promise<{ access_token: string }> {
  const formData = new FormData();
  formData.append('username', role);
  formData.append('password', password);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/token`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Invalid role or password');
  }

  const data = await response.json();
  return data;
}
