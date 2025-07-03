package com.zone01.users.service;

import com.zone01.users.dto.UpdateUserDTO;
import com.zone01.users.user.User;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
@AllArgsConstructor
public class HelperUserService {
    private final PasswordEncoder passwordEncoder;
    private final FileServices fileServices;

    public Optional<String> processAvatar(MultipartFile avatar) throws IOException {
        if (avatar == null || avatar.isEmpty()) return Optional.empty();
        fileServices.validateFile(avatar);
        return Optional.of(fileServices.saveFile(avatar));
    }

    public void updateEntity(User entity, UpdateUserDTO dto) {
        Optional.ofNullable(dto.getName()).ifPresent(entity::setName);
        if (dto.getNew_password() != null && dto.getPrev_password() != null) {
            if (passwordEncoder.matches(dto.getPrev_password(), entity.getPassword())) {
                entity.setPassword(passwordEncoder.encode(dto.getNew_password()));
            } else {
                throw new BadCredentialsException("The password you provided doesn't match with the actual one.");
            }
        }
    }

    public void updateProcessAvatar(User entity, UpdateUserDTO dto) throws IOException {

        try {
            Optional<String> avatarOptional = this.processAvatar(dto.getAvatar());
            if (avatarOptional.isEmpty()) return;
            String avatar = avatarOptional.get();

            if (entity.getAvatar() != null)
                fileServices.deleteOldAvatar(entity.getAvatar());

            entity.setAvatar(avatar);
        } catch (Exception e) {
            throw new IOException(e.getMessage());
        }
    }

}
