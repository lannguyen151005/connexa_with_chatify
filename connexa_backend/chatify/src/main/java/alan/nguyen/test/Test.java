package alan.nguyen.test;

import alan.nguyen.entity.User;
import jakarta.inject.Inject;

public class Test {

    public static void main(String[] args) {
        User user = new User();
        user.setUsername("sdsd");
        System.out.println(user.getUsername());

    }
}
