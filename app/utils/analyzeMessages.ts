export const analyzeMessages = (content: string) => {
  let participant1: string = '';
        let participant2: string = '';
        let participant1MessageCount: number = 0;
        let participant2MessageCount: number = 0;
        let participant1LinksCount: number = 0;
        let participant2LinksCount: number = 0;
        const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        const dayOfWeekMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dayOfWeekCounts: { [key: number]: number } = {};
        let mostActiveDay = '';
        let dayOfWeekActive=0;
        let maxDayCount = 0;
        // Encontrar el mes con más mensajes
        let maxMonth = '';
        let maxCount = 0;
        let maxHour = -1;
        let maxCountHour = 0;
        const daySet = new Set();
        let totalMessagesavg = 0;
        // Encontrar el emoji más usado
        let mostUsedEmoji = '';
        let mostUsedEmojiCount = 0;
        
        const emojiCounts: Record<string, number> = {};
        // Dividir el contenido por saltos de línea para obtener los mensajes
        const messages = content.split('\n').filter(msg => msg.trim().length > 0).slice(1);
        // Devolver la cantidad de mensajes
        let countMessage = 0;
        const urlRegex = /\b(?:https?|www)\S+\b/;  // Regex para detectar enlaces
        const monthCounts: Record<string, number> = {};
        const hourCountMap: { [key: string]: number } = {};
        // Recorrer cada mensaje y contar los mensajes por persona
        messages.forEach(message => {
        const match = message.match(/^\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}\s*[ap]\.\s*m\. - (.+): /); // Buscar el nombre del participante
        const fullMatchEmoji = message.match(/^\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}\s*[ap]\.\s*m\. - (.+?): (.+)/);
        const dateMatch = message.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),/);
        const emojiRegex = /([\uD800-\uDBFF][\uDC00-\uDFFF])/g;
        
        
        if (fullMatchEmoji) {
            const messageTextEmoji = fullMatchEmoji[2];
            const emojis = messageTextEmoji.match(emojiRegex);
            if(emojis){
            for (const emoji of emojis) {
                emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
            }
            }        
        }
        // Hacemos otro match solo para extraer la hora y el periodo (a.m./p.m.)
        const timeMatch = message.match(/, (\d{1,2}):(\d{2})\s([ap])\.?\s*m\./);
        if (timeMatch) {
            // Extraemos la hora, minutos y AM/PM
            const hour = timeMatch[1];  // La hora extraída
            const minutes = timeMatch[2];  // Los minutos extraídos
            const ampm = timeMatch[3];  // a.m. o p.m.

            // Convertir a una hora en formato de 24 horas (para comparación)
            let hour24 = parseInt(hour);
            if (ampm === 'p' && hour24 < 12) {
            hour24 += 12;  // Convertir a 24 horas para p.m.
            }
            if (ampm === 'a' && hour24 === 12) {
            hour24 = 0;  // Convertir 12 a.m. a 0 horas
            }

            // Usamos la hora de 24 horas como clave para contar los mensajes
            if (!hourCountMap[hour24]) {
            hourCountMap[hour24] = 0;
            }
            hourCountMap[hour24]++;
        }else {
            console.log("No se encontró la hora en el mensaje:", message);
        }
        if (dateMatch) {
            const [, day, month, year] = dateMatch;
            const key = `${year}-${month.padStart(2, '0')}`; // Ej: 2025-05
            monthCounts[key] = (monthCounts[key] || 0) + 1;


            const dayAvg = `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
            daySet.add(dayAvg); // guardar días únicos
            totalMessagesavg++;


            const dayActive = parseInt(dateMatch[1]);
            const monthActive = parseInt(dateMatch[2]) - 1; // JS usa 0-11 para meses
            const yearActive = parseInt(dateMatch[3]);
            const dateActive = new Date(yearActive, monthActive, dayActive);
            dayOfWeekActive = dateActive.getDay(); // 0 (Domingo) a 6 (Sábado)
            
            dayOfWeekCounts[dayOfWeekActive] = (dayOfWeekCounts[dayOfWeekActive] || 0) + 1;

            if (dayOfWeekCounts[dayOfWeekActive] > maxDayCount) {
            maxDayCount = dayOfWeekCounts[dayOfWeekActive];
            }
        }
        if (match) {
            const name = match[1].trim();  // Extraemos el nombre y lo limpiamos de espacios extra
            const links = message.match(urlRegex);  // Buscar los links en el mensaje
            // Si aún no se ha asignado el primer participante
            if (!participant1) {
            participant1 = name;
            }
            // Si el primer participante ya está asignado, asignamos el segundo
            else if (!participant2 && name !== participant1) {
            participant2 = name;
            }

            // Incrementamos el contador correspondiente según el nombre del participante
            if (name === participant1) {
            participant1MessageCount++;
            } else if (name === participant2) {
            participant2MessageCount++;
            }

            // Si el mensaje tiene links, aumentamos el contador
            if (links) {
            if (name === participant1) {
                participant1LinksCount += links.length;
            } else if (name === participant2) {
                participant2LinksCount += links.length;
            }
            }
        }
        });

        for (const [month, count] of Object.entries(monthCounts)) {
        if (count > maxCount) {
            maxCount = count;
            maxMonth = month;
        }
        }
        // Extraer nombre del mes
        const [year, monthNumStr] = maxMonth.split('-');
        const monthIndex = parseInt(monthNumStr, 10) - 1;
        const monthName = monthNames[monthIndex];
        for (const [hour, count] of Object.entries(hourCountMap)) {
        if (count > maxCountHour) {
            maxCountHour = count;
            maxHour = parseInt(hour);
        }
        }
        for (const [emoji, count] of Object.entries(emojiCounts)) {
        if (count > mostUsedEmojiCount) {
            mostUsedEmoji = emoji;
            mostUsedEmojiCount = count;
        }
        }
        // Convertir la hora al formato de 12 horas (a.m. / p.m.)
        const formattedMaxHour = maxHour > 12 ? `${maxHour - 12} p.m.` : `${maxHour === 0 ? 12 : maxHour} a.m.`;
        countMessage=participant1MessageCount+participant2MessageCount;

        const totalDaysAvg = daySet.size;
        const avgMessagesPerDay = totalDaysAvg > 0 ? (totalMessagesavg / totalDaysAvg).toFixed(2) : 0;

        const mostActiveDayIndex = Object.entries(dayOfWeekCounts).reduce(
          (maxDay, [day, count]) =>
            count > (dayOfWeekCounts[Number(maxDay)] ?? 0)
              ? Number(day)
              : Number(maxDay),
          0
        );

        mostActiveDay = dayOfWeekMap[mostActiveDayIndex];
        return {
        countMessage,
        participant1,
        participant2,
        participant1MessageCount,
        participant2MessageCount,
        participant1LinksCount,
        participant2LinksCount,
        maxCount,
        monthName,
        year,
        maxCountHour,
        formattedMaxHour,
        avgMessagesPerDay,
        mostActiveDay,
        mostUsedEmoji
        };
};