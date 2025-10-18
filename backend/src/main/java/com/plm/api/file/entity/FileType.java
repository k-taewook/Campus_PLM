package com.plm.api.file.entity;

public enum FileType {
    DOCUMENT("문서"),
    IMAGE("이미지"),
    VIDEO("비디오"),
    AUDIO("오디오"),
    ARCHIVE("압축파일"),
    CODE("코드"),
    OTHER("기타");
    
    private final String description;
    
    FileType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
