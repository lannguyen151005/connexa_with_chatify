package alan.nguyen.service.chatbot;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Service quan ly trang thai hoat dong va cau hinh tap trung cua Tro ly Charles (Connexa AI).
 * Dam bao thread-safe giua AdminController va ChatbotController.
 */
@ApplicationScoped
public class ChatbotConfigService {

    private final AtomicBoolean isEnabled = new AtomicBoolean(true);
    private final AtomicLong tokensUsed = new AtomicLong(15420);

    public boolean isBotActive() {
        return isEnabled.get();
    }

    public void setBotActive(boolean active) {
        isEnabled.set(active);
    }

    public long getTokensUsed() {
        return tokensUsed.get();
    }

    public void recordTokensUsed(long delta) {
        if (delta > 0) {
            tokensUsed.addAndGet(delta);
        }
    }
}