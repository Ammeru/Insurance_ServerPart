import cron from 'node-cron';
import { InsurancePolicies, InsuranceStatus} from "../database/models/InsurancePolicies";
import { Op } from '@sequelize/core';

cron.schedule('0 0 * * *', async () => {
    const now = new Date();
    try {
        const [updatedCount] = await InsurancePolicies.update(
            { insuranceStatus: InsuranceStatus.EXPIRED },
            {
                where: {
                    endDate: { [Op.lt]: now },
                    insuranceStatus: {
                        [Op.notIn]: [InsuranceStatus.EXPIRED, InsuranceStatus.DECLINED],
                    },
                },
            }
        );

        if (updatedCount > 0) {
            console.log(`[CRON] Обновлено ${updatedCount} просроченных полисов на EXPIRED`);
        } else {
            console.log('[CRON] Нет новых просроченных полисов');
        }
    } catch (error) {
        console.error('[CRON] Ошибка при обновлении просроченных полисов:', error);
    }
});