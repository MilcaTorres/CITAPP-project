import emailjs from '@emailjs/browser';
import { supabase } from '../lib/supabase';

// REEMPLAZA ESTOS VALORES CON LOS DE TU CUENTA DE EMAILJS
const SERVICE_ID = 'service_te6zaed';
const TEMPLATE_ID = 'template_px45jgd';
const PUBLIC_KEY = 'ZsyWy-JV2bDhan6v7';

const TEMPLATE_ID_RECOVERY = 'template_uv0mfzi'; // Nuevo Template ID

// ... (DiscrepancyData interface)

export const sendRecoveryCode = async (email: string, code: string) => {
    try {
        const templateParams = {
            to_email: email, // Asegúrate de que tu template use {{to_email}} o configura EmailJS para usar esto
            code: code,
            reply_to: 'soporte@citapp.com'
        };

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID_RECOVERY,
            templateParams,
            PUBLIC_KEY
        );

        console.log('Código de recuperación enviado:', response.status);
        return true;
    } catch (error) {
        console.error('Error enviando código:', error);
        return false;
    }
};

interface DiscrepancyData {
    product_name: string;
    product_code: string;
    system_qty: number;
    physical_qty: number;
    employee_code: string;
    observations: string;
}

export const sendDiscrepancyEmail = async (data: DiscrepancyData) => {
    try {
        // 1. Obtener correos de todos los administradores activos
        const { data: admins, error } = await supabase
            .from('usuarios')
            .select('email')
            .eq('rol', 'admin')
            .eq('activo', true);

        if (error) {
            console.error('Error obteniendo administradores:', error);
            return false;
        }

        if (!admins || admins.length === 0) {
            console.warn('No hay administradores activos para enviar el correo.');
            return false;
        }

        // Unir correos con comas (EmailJS acepta esto para múltiples destinatarios)
        const adminEmails = admins.map(a => a.email).join(',');

        const templateParams = {
            to_name: 'Administradores',
            email: adminEmails, // Esto llenará la variable {{email}} en el "To Email"
            product_name: data.product_name,
            product_code: data.product_code,
            system_qty: data.system_qty,
            physical_qty: data.physical_qty,
            employee_code: data.employee_code,
            observations: data.observations || 'Ninguna',
            date: new Date().toLocaleString()
        };

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            templateParams,
            PUBLIC_KEY
        );

        console.log('Correo enviado con éxito a:', adminEmails, response.status, response.text);
        return true;
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        return false;
    }
};
