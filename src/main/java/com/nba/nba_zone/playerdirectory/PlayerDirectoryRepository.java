package com.nba.nba_zone.playerdirectory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerDirectoryRepository extends JpaRepository<PlayerDirectory, Long> {
    List<PlayerDirectory> findByActiveTrueOrderByLastNameAsc();
    Optional<PlayerDirectory> findByFullNameIgnoreCase(String fullName);
    List<PlayerDirectory> findByFullNameContainingIgnoreCase(String fullName);
}
