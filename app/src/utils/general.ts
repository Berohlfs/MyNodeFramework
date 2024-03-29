export const generateUniqueFileName = () => {
    return Date.now() + '-' + Math.round(Math.random() * 1e9)
}

export const responseMessage = (message: string, query?: any) => {
    return {
        message,
        query
    }
}

export const server_error_msg = responseMessage('Erro interno de servidor.')
