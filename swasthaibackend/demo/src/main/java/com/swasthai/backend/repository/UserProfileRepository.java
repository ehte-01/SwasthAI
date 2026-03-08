package com.swasthai.backend.repository;

import com.swasthai.backend.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, String> {

    @Query(value = "SELECT * FROM user_profiles WHERE user_id = CAST(:userId AS uuid)", nativeQuery = true)
    Optional<UserProfile> findByUserId(@Param("userId") String userId);

    @Modifying
    @Query(value = "DELETE FROM user_profiles WHERE user_id = CAST(:userId AS uuid)", nativeQuery = true)
    void deleteByUserId(@Param("userId") String userId);
}