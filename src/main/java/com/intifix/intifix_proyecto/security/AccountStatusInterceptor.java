package com.intifix.intifix_proyecto.security;

import com.intifix.intifix_proyecto.model.User;
import com.intifix.intifix_proyecto.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AccountStatusInterceptor implements HandlerInterceptor {

    private final UserRepository userRepository;

    public AccountStatusInterceptor(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        String uri = request.getRequestURI();

        if (uri.contains("/profile/reactivate")) {
            return true;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth.getName() == null) {
            return true;
        }

        User user = userRepository.findByEmail(auth.getName()).orElse(null);

        if (user != null && "INACTIVO".equals(user.getAccountStatus())) {

            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setCharacterEncoding("UTF-8");
            response.setContentType("text/plain; charset=UTF-8");

            response.getWriter().write("Tu cuenta está desactivada.");

            return false;
        }

        return true;
    }
}